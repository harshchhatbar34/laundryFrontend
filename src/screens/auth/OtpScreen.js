import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, sendOtp, clearError } from '../../store/authSlice';
import { useTheme } from '../../theme/ThemeProvider';
import ThemedButton from '../../components/ThemedButton';
import WatermarkView from '../../components/WatermarkView';

const OTP_LENGTH = 6;
const RESEND_TIMER = 60;

export default function OtpScreen({ route, navigation }) {
  const { mobileNumber } = route.params;
  const dispatch = useDispatch();
  const { loading, error, isNewUser } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIMER);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) return;
    dispatch(clearError());
    const result = await dispatch(verifyOtp({ mobileNumber, otp: code }));
    if (verifyOtp.fulfilled.match(result)) {
      if (result.payload.isNewUser) {
        navigation.replace('ProfileSetup');
      }
      // If existing user, AppNavigator auto-switches to TabNavigator
    }
  };

  const handleResend = () => {
    setTimer(RESEND_TIMER);
    setOtp(Array(OTP_LENGTH).fill(''));
    dispatch(sendOtp(mobileNumber));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <WatermarkView />
      <ScrollView
        contentContainerStyle={[styles.container, { padding: spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 48, textAlign: 'center' }}>🔐</Text>
        <Text style={[typography.h2, { color: colors.text, textAlign: 'center', marginTop: spacing.md }]}>
          Enter OTP
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl }]}>
          Sent to +91 {mobileNumber}
        </Text>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              value={digit}
              onChangeText={(t) => handleChange(t.replace(/\D/g, ''), i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              maxLength={1}
              keyboardType="number-pad"
              style={[
                styles.otpBox,
                {
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderRadius: radius.md,
                  ...typography.h2,
                },
              ]}
            />
          ))}
        </View>

        {error && (
          <Text style={[typography.bodySmall, { color: colors.error, textAlign: 'center', marginBottom: spacing.md }]}>
            {error}
          </Text>
        )}

        <ThemedButton
          label="Verify OTP"
          onPress={handleVerify}
          loading={loading}
          disabled={otp.join('').length !== OTP_LENGTH}
          style={{ marginTop: spacing.md }}
        />

        <TouchableOpacity onPress={handleResend} disabled={timer > 0} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Text style={[typography.body, { color: timer > 0 ? colors.textMuted : colors.primary }]}>
            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  otpBox: {
    width: 48,
    height: 56,
    textAlign: 'center',
    borderWidth: 2,
    fontSize: 22,
    fontWeight: '700',
  },
});
