import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { createHelper } from '../../api/owner';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerSettingsStackParamList } from '../../navigation/OwnerTabs';

type Props = NativeStackScreenProps<OwnerSettingsStackParamList, 'AddHelper'>;

export default function AddHelperScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) { dispatch(showToast({ type: 'warning', message: 'All fields are required' })); return; }
    setLoading(true);
    try { await createHelper(form); navigation.goBack(); }
    catch (e) { dispatch(showToast({ type: 'error', message: 'Failed to create helper' })); }
    finally { setLoading(false); }
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Add Helper" showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Input label="Name" value={form.name} onChangeText={(v) => set('name', v)} icon="person-outline" />
          <Input label="Email" value={form.email} onChangeText={(v) => set('email', v)} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" value={form.password} onChangeText={(v) => set('password', v)} icon="lock-closed-outline" secureTextEntry />
          <Button title="Create Helper" onPress={handleSave} loading={loading} icon="person-add-outline" style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
