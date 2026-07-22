import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { isValidEmail, isValidPassword } from '../../utils/helpers';
import { APP_NAME } from '../../utils/constants';
import { login } from '../../store/slices/authSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { AppDispatch } from '../../store';
import api from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const e: { email?: string; password?: string; general?: string } = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    else if (!isValidPassword(password)) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      // Call API directly first so we can intercept requiresVerification
      const response = await api.post(
        '/api/auth/login',
        { email: email.trim().toLowerCase(), password },
        { validateStatus: () => true } // don't throw on 4xx
      );

      const data = response.data;

      // Unverified customer — navigate directly to OTP screen
      if (!data?.success && data?.requiresVerification && data?.data?.userId) {
        navigation.navigate('VerifyOTP', {
          userId: data.data.userId,
          email: data.data.email,
        });
        return;
      }

      // Normal error
      if (!data?.success || !data?.data) {
        setErrors({ general: data?.message || 'Login failed' });
        return;
      }

      // Success — dispatch loginSuccess to set auth state
      await dispatch(login({ email: email.trim().toLowerCase(), password })).unwrap();
    } catch (err: any) {
      setErrors({ general: err?.response?.data?.message || err?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={theme.gradients.ocean as any} style={styles.header}>
            <Text style={styles.emoji}>🧺</Text>
            <Text style={[theme.typography.displayMedium, { color: '#FFF' }]}>{APP_NAME}</Text>
            <Text style={[theme.typography.bodySmall, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
              Welcome back
            </Text>
          </LinearGradient>

          <View style={[styles.form, { backgroundColor: theme.colors.background }]}>
            {errors.general && (
              <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorBg }]}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
                <Text style={[theme.typography.bodySmall, { color: theme.colors.error, marginLeft: 8, flex: 1 }]}>
                  {errors.general}
                </Text>
              </View>
            )}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              textContentType="username"
              autoComplete="email"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              secureTextEntry
              error={errors.password}
              textContentType="password"
              autoComplete="password"
            />

            <Button title="Login" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ alignItems: 'flex-end', marginTop: 14 }}
            >
              <Text style={[theme.typography.bodySmall, { color: theme.colors.primary, fontWeight: '600' }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                Don't have an account?{' '}
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Register</Text>
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
    flex: 1, paddingHorizontal: 24,
    paddingTop: 32, paddingBottom: 32,
    marginTop: -20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 10, marginBottom: 16,
  },
  link: { alignItems: 'center', marginTop: 24, paddingVertical: 12 },
});
