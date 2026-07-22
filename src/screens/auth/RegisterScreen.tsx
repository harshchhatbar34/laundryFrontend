import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { APP_NAME } from '../../utils/constants';
import { isValidEmail, isStrongPassword } from '../../utils/helpers';
import { register } from '../../store/slices/authSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { AppDispatch } from '../../store';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Shop code — pre-filled from deep link if available
  const [shopCode, setShopCode] = useState('');
  const [codeFromLink, setCodeFromLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    mobileNumber?: string;
    password?: string;
    confirmPassword?: string;
    shopCode?: string;
    general?: string;
  }>({});

  // Auto-fill code from deep link param
  useEffect(() => {
    const code = route?.params?.tenantCode;
    if (code) {
      setShopCode(code.toUpperCase());
      setCodeFromLink(true);
    }
  }, [route?.params?.tenantCode]);

  const validate = () => {
    const e: typeof errors = {};

    if (!name.trim()) e.name = 'Name is required';

    if (!email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(email)) e.email = 'Invalid email format';

    if (!mobileNumber.trim()) {
      e.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(mobileNumber.trim())) {
      e.mobileNumber = 'Must be exactly 10 digits';
    }

    if (!password) {
      e.password = 'Password is required';
    } else if (!isStrongPassword(password)) {
      e.password = 'Min 8 chars with uppercase, lowercase, number & special character';
    }

    if (!confirmPassword) {
      e.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }

    if (!shopCode.trim()) {
      e.shopCode = 'Shop code is required';
    } else if (shopCode.trim().length < 4) {
      e.shopCode = 'Enter a valid shop code';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const result = await dispatch(
        register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          tenantCode: shopCode.trim().toUpperCase(),
          mobileNumber: mobileNumber.trim(),
        })
      ).unwrap();

      // Navigate to OTP verification — do NOT auto-login
      navigation.navigate('VerifyOTP', {
        userId: result.userId,
        email: result.email,
      });
    } catch (message) {
      const msg = String(message);
      if (msg.toLowerCase().includes('tenant') || msg.toLowerCase().includes('code') || msg.toLowerCase().includes('shop')) {
        setErrors({ shopCode: 'Invalid shop code. Please check and try again.' });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <LinearGradient colors={theme.gradients.ocean as any} style={styles.header}>
            <Text style={styles.emoji}>🧺</Text>
            <Text style={[theme.typography.displayMedium, { color: '#FFF' }]}>Create Account</Text>
            <Text style={[theme.typography.bodySmall, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
              Join {APP_NAME} today
            </Text>
          </LinearGradient>

          <View style={[styles.form, { backgroundColor: theme.colors.background }]}>

            {/* General error */}
            {errors.general && (
              <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorBg }]}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
                <Text style={[theme.typography.bodySmall, { color: theme.colors.error, marginLeft: 8, flex: 1 }]}>
                  {errors.general}
                </Text>
              </View>
            )}

            {/* Personal Info */}
            <Input label="Full Name" value={name} onChangeText={setName} icon="person-outline"
              error={errors.name} textContentType="name" autoComplete="name" />
            <Input label="Email" value={email} onChangeText={setEmail} icon="mail-outline"
              keyboardType="email-address" autoCapitalize="none" error={errors.email}
              textContentType="emailAddress" autoComplete="email" />
            <Input label="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber}
              icon="call-outline" keyboardType="phone-pad" error={errors.mobileNumber}
              textContentType="telephoneNumber" autoComplete="tel" />
            <Input label="Password" value={password} onChangeText={setPassword}
              icon="lock-closed-outline" secureTextEntry error={errors.password}
              textContentType="newPassword" autoComplete="password-new" />
            <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword}
              icon="lock-closed-outline" secureTextEntry error={errors.confirmPassword}
              textContentType="newPassword" autoComplete="password-new" />

            {/* Shop Code Section */}
            <View style={[styles.shopCodeCard, {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: errors.shopCode ? theme.colors.error : codeFromLink ? theme.colors.success : theme.colors.border,
              borderWidth: codeFromLink || errors.shopCode ? 1.5 : 1,
            }]}>
              {/* Header row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={[styles.shopCodeIconBg, { backgroundColor: theme.colors.primary + '18' }]}>
                  <Ionicons name="storefront-outline" size={18} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
                    Shop Code <Text style={{ color: theme.colors.error }}>*</Text>
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 1 }]}>
                    Enter the code shared by your laundry shop
                  </Text>
                </View>
                {codeFromLink && (
                  <View style={[styles.autoFillBadge, { backgroundColor: theme.colors.success + '18' }]}>
                    <Ionicons name="link-outline" size={11} color={theme.colors.success} />
                    <Text style={{ fontSize: 10, color: theme.colors.success, fontWeight: '700', marginLeft: 3 }}>
                      Auto-filled
                    </Text>
                  </View>
                )}
              </View>

              {/* Code input */}
              <Input
                label=""
                value={shopCode}
                onChangeText={(t) => {
                  setShopCode(t.toUpperCase());
                  setCodeFromLink(false);
                }}
                icon="barcode-outline"
                autoCapitalize="characters"
                placeholder="e.g. ABC12345"
                error={errors.shopCode}
                editable={!codeFromLink}
              />

              {/* Info note */}
              {!errors.shopCode && (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 }}>
                  <Ionicons name="information-circle-outline" size={13} color={theme.colors.textMuted} />
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginLeft: 5, flex: 1, lineHeight: 16 }]}>
                    Ask your laundry owner for this code, or use their shareable invite link to auto-fill it.
                  </Text>
                </View>
              )}
            </View>

            <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                Already have an account?{' '}
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 60, paddingBottom: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  emoji: { fontSize: 56, marginBottom: 8 },
  form: {
    flex: 1, paddingHorizontal: 24, paddingTop: 32,
    marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 10, marginBottom: 16,
  },
  shopCodeCard: {
    borderRadius: 14, padding: 14, marginTop: 8, marginBottom: 8,
  },
  shopCodeIconBg: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  autoFillBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  link: { alignItems: 'center', marginTop: 24, paddingVertical: 12 },
});
