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
      const response = await api.post(
        '/api/auth/login',
        { email: email.trim().toLowerCase(), password },
        { validateStatus: () => true }
      );

      const data = response.data;

      if (!data?.success && data?.requiresVerification && data?.data?.userId) {
        navigation.navigate('VerifyOTP', {
          userId: data.data.userId,
          email: data.data.email,
        });
        return;
      }

      if (!data?.success || !data?.data) {
        setErrors({ general: data?.message || 'Login failed' });
        return;
      }

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
          <LinearGradient
            colors={theme.gradients.ocean as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            {/* 2026 Theme Circular Emblem Badge */}
            <View style={styles.logoBadge}>
              <Ionicons name="shirt-outline" size={32} color="#C9A227" />
            </View>

            <Text style={styles.appTitle}>{APP_NAME}</Text>
            <Text style={styles.tagline}>
              Premium • Laundry Care • Excellence
            </Text>
          </LinearGradient>

          <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
            {errors.general && (
              <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorBg, borderRadius: 12 }]}>
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
              textContentType="emailAddress"
              autoComplete="email"
              surfaceColor={theme.colors.surface}
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
              surfaceColor={theme.colors.surface}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              variant="primary"
              size="large"
              style={{ marginTop: 12 }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ alignItems: 'flex-end', marginTop: 16 }}
            >
              <Text style={[theme.typography.bodySmall, { color: theme.colors.primary, fontWeight: '700' }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                Don&apos;t have an account?{' '}
                <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Register</Text>
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
    paddingTop: 56,
    paddingBottom: 48,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: '#C9A227',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#C9A227',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    letterSpacing: 0.4,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  link: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
  },
});
