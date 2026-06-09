import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { completeProfile } from '../../store/authSlice';
import { useTheme } from '../../theme/ThemeProvider';
import ThemedButton from '../../components/ThemedButton';
import ThemedInput from '../../components/ThemedInput';
import WatermarkView from '../../components/WatermarkView';

export default function ProfileSetupScreen() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;

  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await dispatch(completeProfile(form));
    // AppNavigator detects isLoggedIn change and switches to TabNavigator
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <WatermarkView />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: spacing.lg, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 56, textAlign: 'center' }}>👋</Text>
        <Text style={[typography.h2, { color: colors.text, textAlign: 'center', marginTop: spacing.md }]}>
          Welcome!
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: spacing.xl }]}>
          Tell us a bit about yourself
        </Text>

        <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <ThemedInput
            label="Full Name"
            value={form.name}
            onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
            placeholder="Rahul Sharma"
            error={errors.name}
            leftIcon={<Text style={{ fontSize: 16 }}>👤</Text>}
          />
          <ThemedInput
            label="Email Address"
            value={form.email}
            onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
            placeholder="rahul@example.com"
            keyboardType="email-address"
            error={errors.email || error}
            leftIcon={<Text style={{ fontSize: 16 }}>📧</Text>}
          />
          <ThemedButton label="Continue" onPress={handleSubmit} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
