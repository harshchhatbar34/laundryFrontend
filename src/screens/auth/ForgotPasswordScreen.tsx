import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { isValidEmail } from '../../utils/helpers';
import { APP_NAME } from '../../utils/constants';
import { forgotPassword } from '../../api/auth';
import { showToast } from '../../store/slices/uiSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!isValidEmail(email)) {
      setError('Invalid email format');
      return false;
    }
    return true;
  };

  const handleSendLink = async () => {
    Keyboard.dismiss();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      if (res?.success) {
        dispatch(
          showToast({
            type: 'success',
            message: res?.message || 'Password reset link sent to your email.',
          })
        );
        navigation.navigate('Login');
      } else {
        setError(res?.message || 'Failed to send reset link.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="always">
          <LinearGradient colors={theme.gradients.ocean as any} style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-unread-outline" size={34} color="#FFF" />
            </View>
            <Text style={[theme.typography.displayMedium, { color: '#FFF' }]}>{APP_NAME}</Text>
            <Text style={[theme.typography.bodySmall, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
              Reset your password
            </Text>
          </LinearGradient>

          <View style={[styles.form, { backgroundColor: theme.colors.background }]}>
            {error ? (
              <View style={[styles.banner, { backgroundColor: theme.colors.errorBg }]}>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 20, textAlign: 'center', lineHeight: 22 }]}>
              Enter your registered email address below. We'll send you a secure link to reset your password.
            </Text>

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              editable={!loading}
            />

            <Button
              title={loading ? 'Sending...' : 'Send Reset Link'}
              onPress={handleSendLink}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                Back to{' '}
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
  backBtn: { position: 'absolute', top: 56, left: 20, padding: 4 },
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
  banner: { padding: 12, borderRadius: 10, marginBottom: 16 },
  link: { alignItems: 'center', marginTop: 24, paddingVertical: 12 },
});
