import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import api from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOTP'>;

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

export default function VerifyOTPScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { userId, email } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);

  // Shake animation for wrong OTP
  const shakeAnim = useRef(new Animated.Value(0)).current;
  // Success scale animation
  const successScale = useRef(new Animated.Value(0)).current;
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return; // digits only
    const newOtp = [...otp];

    if (val.length > 1) {
      // Handle paste — distribute digits
      const digits = val.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const updated = Array(OTP_LENGTH).fill('');
      digits.split('').forEach((d, i) => { updated[i] = d; });
      setOtp(updated);
      inputRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    newOtp[index] = val;
    setOtp(newOtp);
    setError('');

    if (val && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit code.');
      shake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/verify-otp', { userId, otp: code });
      const { token, user } = res.data?.data || {};
      if (!token || !user) throw new Error('Verification failed. Please try again.');

      // Animate success
      setSuccess(true);
      Animated.spring(successScale, { toValue: 1, damping: 12, stiffness: 150, useNativeDriver: true }).start();

      // Brief pause then dispatch login
      setTimeout(() => {
        dispatch(loginSuccess({ token, user }));
      }, 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid OTP.';
      setError(msg);
      shake();
      // Clear OTP boxes on wrong code
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError('');
    try {
      await api.post('/api/auth/resend-otp', { userId });
      setOtp(Array(OTP_LENGTH).fill(''));
      setCountdown(RESEND_COUNTDOWN);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1****$3');

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <LinearGradient colors={theme.gradients.ocean as any} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.emoji}>📧</Text>
          <Text style={[theme.typography.displayMedium, { color: '#FFF', marginTop: 8 }]}>
            Verify Email
          </Text>
          <Text style={[theme.typography.bodySmall, { color: 'rgba(255,255,255,0.75)', marginTop: 6, textAlign: 'center' }]}>
            We sent a 6-digit code to{'\n'}
            <Text style={{ fontWeight: '700', color: '#FFF' }}>{maskedEmail}</Text>
          </Text>
        </LinearGradient>

        <View style={[styles.body, { backgroundColor: theme.colors.background }]}>

          {/* Success overlay */}
          {success && (
            <Animated.View style={[styles.successOverlay, { transform: [{ scale: successScale }] }]}>
              <View style={[styles.successCircle, { backgroundColor: theme.colors.success }]}>
                <Ionicons name="checkmark" size={40} color="#FFF" />
              </View>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 16 }]}>
                Verified! 🎉
              </Text>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 6 }]}>
                Logging you in...
              </Text>
            </Animated.View>
          )}

          {!success && (
            <>
              {/* OTP boxes */}
              <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={r => { inputRefs.current[i] = r; }}
                    style={[
                      styles.otpBox,
                      {
                        borderColor: error
                          ? theme.colors.error
                          : digit
                          ? theme.colors.primary
                          : theme.colors.border,
                        backgroundColor: digit ? theme.colors.primary + '10' : theme.colors.surfaceVariant,
                        color: theme.colors.textPrimary,
                      },
                    ]}
                    value={digit}
                    onChangeText={v => handleChange(v, i)}
                    onKeyPress={e => handleKeyPress(e, i)}
                    keyboardType="number-pad"
                    maxLength={OTP_LENGTH} // allow paste
                    textAlign="center"
                    selectTextOnFocus
                    autoFocus={i === 0}
                  />
                ))}
              </Animated.View>

              {/* Error */}
              {!!error && (
                <View style={[styles.errorRow, { backgroundColor: theme.colors.errorBg }]}>
                  <Ionicons name="alert-circle-outline" size={15} color={theme.colors.error} />
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.error, marginLeft: 6, flex: 1 }]}>
                    {error}
                  </Text>
                </View>
              )}

              {/* Verify button */}
              <Button
                title="Verify & Continue"
                onPress={handleVerify}
                loading={loading}
                style={{ marginTop: 24 }}
                icon="shield-checkmark-outline"
                iconPosition="left"
                fullWidth
              />

              {/* Resend */}
              <View style={styles.resendRow}>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                  Didn't receive the code?{' '}
                </Text>
                {canResend ? (
                  <TouchableOpacity onPress={handleResend} disabled={resending}>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.primary, fontWeight: '700' }]}>
                      {resending ? 'Sending...' : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>
                    Resend in {countdown}s
                  </Text>
                )}
              </View>

              {/* Info */}
              <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.textMuted} />
                <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginLeft: 8, flex: 1, lineHeight: 18 }]}>
                  Check your spam/junk folder if you don't see the email. The code is valid for 10 minutes.
                </Text>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingBottom: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    padding: 4,
  },
  emoji: { fontSize: 52 },
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  otpBox: {
    flex: 1,
    height: 58,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 22,
    fontWeight: '800',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 24,
  },
  successOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
