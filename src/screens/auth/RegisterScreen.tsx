import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { TENANT_CODE, APP_NAME } from '../../utils/constants';
import { isValidEmail, isStrongPassword } from '../../utils/helpers';
import { register } from '../../store/slices/authSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { AppDispatch } from '../../store';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    mobileNumber?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validate = () => {
    const e: {
      name?: string;
      email?: string;
      mobileNumber?: string;
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

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
      e.password = 'Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    if (!confirmPassword) {
      e.confirmPassword = 'Please reconfirm password';
    } else if (password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await dispatch(
        register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          tenantCode: TENANT_CODE,
          mobileNumber: mobileNumber.trim(),
        })
      ).unwrap();
    } catch (message) {
      setErrors({ general: String(message) });
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
            <Text style={[theme.typography.displayMedium, { color: '#FFF' }]}>Create Account</Text>
            <Text style={[theme.typography.bodySmall, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
              Join {APP_NAME} today
            </Text>
          </LinearGradient>
          <View style={[styles.form, { backgroundColor: theme.colors.background }]}>
            {errors.general && (
              <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorBg }]}>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.error }]}>{errors.general}</Text>
              </View>
            )}
            <Input label="Full Name" value={name} onChangeText={setName} icon="person-outline" error={errors.name}
              textContentType="name" autoComplete="name" />
            <Input label="Email" value={email} onChangeText={setEmail} icon="mail-outline"
              keyboardType="email-address" autoCapitalize="none" error={errors.email}
              textContentType="emailAddress" autoComplete="email" />
            <Input label="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} icon="call-outline"
              keyboardType="phone-pad" error={errors.mobileNumber}
              textContentType="telephoneNumber" autoComplete="tel" />
            <Input label="Password" value={password} onChangeText={setPassword} icon="lock-closed-outline"
              secureTextEntry error={errors.password}
              textContentType="newPassword" autoComplete="password-new" />
            <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} icon="lock-closed-outline"
              secureTextEntry error={errors.confirmPassword}
              textContentType="newPassword" autoComplete="password-new" />
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
  header: { paddingTop: 60, paddingBottom: 50, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  emoji: { fontSize: 56, marginBottom: 8 },
  form: { flex: 1, paddingHorizontal: 24, paddingTop: 32, marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  errorBanner: { padding: 12, borderRadius: 10, marginBottom: 16 },
  link: { alignItems: 'center', marginTop: 24, paddingVertical: 12 },
});
