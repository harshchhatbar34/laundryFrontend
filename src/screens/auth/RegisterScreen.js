import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ThemedButton from '../../components/ThemedButton';
import ThemedInput from '../../components/ThemedInput';
import WatermarkView from '../../components/WatermarkView';
import { clearError, register } from '../../store/authSlice';
import { useTheme } from '../../theme/ThemeProvider';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const validate = () => {
    if (!name || name.trim().length < 2) {
      setValidationError('Enter a valid name (at least 2 characters)');
      return false;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setValidationError('Enter a valid email address');
      return false;
    }
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      setValidationError('Enter a valid 10-digit Indian mobile number');
      return false;
    }
    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    dispatch(clearError());
    dispatch(register({ name: name.trim(), email, mobileNumber, password }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WatermarkView />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { padding: spacing.lg }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[typography.h1, { color: colors.primary }]}>
              Create Account
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              Join LaundryGo to get fresh clothes delivered to your door.
            </Text>
          </View>

          {/* Form */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                padding: spacing.lg,
                borderColor: colors.border,
              },
            ]}
          >
            <ThemedInput
              label="Full Name"
              value={name}
              onChangeText={(t) => { setName(t); setValidationError(''); }}
              placeholder="John Doe"
              error={validationError?.includes('name') ? validationError : null}
              leftIcon={<Text style={{ fontSize: 16 }}>👤</Text>}
            />

            <ThemedInput
              label="Email Address"
              value={email}
              onChangeText={(t) => { setEmail(t); setValidationError(''); }}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={validationError?.includes('email') ? validationError : null}
              leftIcon={<Text style={{ fontSize: 16 }}>✉️</Text>}
            />

            <ThemedInput
              label="Mobile Number"
              value={mobileNumber}
              onChangeText={(t) => { setMobileNumber(t.replace(/\D/g, '')); setValidationError(''); }}
              placeholder="98XXXXXXXX"
              keyboardType="phone-pad"
              maxLength={10}
              error={validationError?.includes('mobile') ? validationError : null}
              leftIcon={<Text style={{ fontSize: 16 }}>📱</Text>}
            />

            <ThemedInput
              label="Password"
              value={password}
              onChangeText={(t) => { setPassword(t); setValidationError(''); }}
              placeholder="Enter at least 6 characters"
              secureTextEntry
              error={validationError?.includes('Password') ? validationError : null}
              leftIcon={<Text style={{ fontSize: 16 }}>🔒</Text>}
            />

            {(error || (validationError && !validationError.includes('name') && !validationError.includes('email') && !validationError.includes('mobile') && !validationError.includes('Password'))) ? (
              <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.sm }]}>
                {error || validationError}
              </Text>
            ) : null}

            <ThemedButton
              label="Sign Up"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: spacing.sm }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[typography.body, { color: colors.primary, fontWeight: 'bold' }]}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center' },
  card: { borderWidth: 1 },
});
