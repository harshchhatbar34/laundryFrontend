import React, { useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import ThemedInput from '../../components/ThemedInput';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import api from '../../api/axiosInstance';
import WatermarkView from '../../components/WatermarkView';

export default function AddAddressScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ label: 'Home', buildingVilla: '', apartmentNo: '', area: '', emirate: 'Dubai', makani: '' });
  const [errors, setErrors] = useState({});

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.buildingVilla.trim()) e.buildingVilla = 'Building or Villa required';
    if (!form.area.trim()) e.area = 'Area required';
    if (!form.emirate.trim()) e.emirate = 'Emirate required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/users/addresses', form);
      route.params?.onGoBack?.();
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <WatermarkView />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <ThemedCard title="Address" style={{ marginBottom: spacing.md }}>
          <ThemedInput label="Building Name / Villa No." value={form.buildingVilla} onChangeText={set('buildingVilla')} placeholder="e.g. Burj Khalifa or Villa 10" error={errors.buildingVilla} />
          <ThemedInput label="Apartment No. (optional)" value={form.apartmentNo} onChangeText={set('apartmentNo')} placeholder="e.g. Apt 402" />
          <ThemedInput label="Area / Community" value={form.area} onChangeText={set('area')} placeholder="e.g. Downtown Dubai" error={errors.area} />
          <ThemedInput label="Emirate" value={form.emirate} onChangeText={set('emirate')} placeholder="e.g. Dubai" error={errors.emirate} />
          <ThemedInput label="Makani Number (optional)" value={form.makani} onChangeText={set('makani')} placeholder="e.g. 12345 67890" error={errors.makani} />
        </ThemedCard>
        <ThemedButton label="Save Address" onPress={handleSave} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
