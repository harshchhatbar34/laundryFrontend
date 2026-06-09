import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ThemedButton from '../../components/ThemedButton';
import ThemedInput from '../../components/ThemedInput';
import WatermarkView from '../../components/WatermarkView';
import { clearError, sendOtp } from '../../store/authSlice';
import { useTheme } from '../../theme/ThemeProvider';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;

  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');

  const validate = () => {
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      setMobileNumberError('Enter a valid 10-digit mobile number');
      return false;
    }
    setMobileNumberError('');
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    dispatch(clearError());
    const result = await dispatch(sendOtp(mobileNumber));

    if (sendOtp.fulfilled.match(result)) {
      navigation.navigate('Otp', { mobileNumber });
      setMobileNumber('');
    }
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
          {/* Hero */}
          <View style={styles.hero}>
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: 120, height: 120, borderRadius: 20 }}
            />
            <Text style={[typography.h1, { color: colors.primary, textAlign: 'center', marginTop: spacing.md }]}>
              LaundryGo
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
              Fresh clothes, delivered to your door.
            </Text>
          </View>

          {/* Card */}
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
            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>
              Login / Register
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
              Enter your mobile number to get started
            </Text>

            <ThemedInput
              label="Mobile Number"
              value={mobileNumber}
              onChangeText={(t) => { setMobileNumber(t.replace(/\D/g, '')); setMobileNumberError(''); }}
              placeholder="98XXXXXXXX"
              keyboardType="phone-pad"
              maxLength={10}
              error={mobileNumberError || error}
              leftIcon={<Text style={{ fontSize: 16 }}>📱</Text>}
            />

            <ThemedButton
              label="Get OTP"
              onPress={handleSend}
              loading={loading}
            />
          </View>

          <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 32 },
  card: { borderWidth: 1 },
});
