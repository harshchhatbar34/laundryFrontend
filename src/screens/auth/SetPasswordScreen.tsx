import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { APP_NAME } from '../../utils/constants';
import { isStrongPassword } from '../../utils/helpers';
import { setPassword as apiSetPassword } from '../../api/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'SetPassword'>;

export default function SetPasswordScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const token = route?.params?.token ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validate = () => {
    const e: {
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

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

  const handleSetPassword = async () => {
    if (!token) {
      setErrors({ general: 'Invalid or missing configuration token.' });
      return;
    }
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await apiSetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update password';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={theme.gradients.ocean as any} style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={34} color="#FFF" />
            </View>
            <Text style={[theme.typography.displayMedium, { color: '#FFF' }]}>{APP_NAME}</Text>
            <Text style={[theme.typography.bodySmall, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
              Password Configuration
            </Text>
          </LinearGradient>

          <View style={[styles.form, { backgroundColor: theme.colors.background }]}>
            {success ? (
              <View style={styles.successContainer}>
                <Text style={[theme.typography.displayMedium, { color: theme.colors.primary, textAlign: 'center', marginBottom: 12 }]}>
                  Password Set!
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 }]}>
                  Your password has been successfully configured. You can now log in using your credentials.
                </Text>
                <Button title="Go to Login" onPress={() => navigation.navigate('Login')} style={{ width: '105%' }} />
              </View>
            ) : (
              <>
                {errors.general && (
                  <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorBg }]}>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.error }]}>{errors.general}</Text>
                  </View>
                )}
                {!token && (
                  <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorBg, marginBottom: 20 }]}>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.error }]}>
                      Error: Configuration link is missing setup token.
                    </Text>
                  </View>
                )}
                <Input
                  label="New Password"
                  value={password}
                  onChangeText={setPassword}
                  icon="lock-closed-outline"
                  secureTextEntry
                  error={errors.password}
                  autoCapitalize="none"
                />
                <Input
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon="lock-closed-outline"
                  secureTextEntry
                  error={errors.confirmPassword}
                  autoCapitalize="none"
                />
                <Button
                  title="Configure Password"
                  onPress={handleSetPassword}
                  loading={loading}
                  disabled={!token}
                  style={{ marginTop: 12 }}
                />
                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
                  <Text style={[theme.typography.body, { color: theme.colors.primary, fontWeight: '600' }]}>
                    Back to Login
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  header: { paddingTop: 60, paddingBottom: 50, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  form: { flex: 1, paddingHorizontal: 24, paddingTop: 32, marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  errorBanner: { padding: 12, borderRadius: 10, marginBottom: 16 },
  successContainer: { flex: 1, alignItems: 'center', paddingTop: 20 },
  link: { alignItems: 'center', marginTop: 24, paddingVertical: 12 },
});
