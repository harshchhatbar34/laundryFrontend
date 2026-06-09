import React, { useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform, View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import ThemedInput from '../../components/ThemedInput';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import api from '../../api/axiosInstance';
import WatermarkView from '../../components/WatermarkView';
import StatePicker from '../../components/StatePicker';

export default function AddAddressScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ label: 'Home', flatHouseNo: '', society: '', landmark: '', pincode: '', city: '', state: '' });
  const [errors, setErrors] = useState({});

  const labels = ['Home', 'Work', 'Other'];

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.flatHouseNo.trim()) e.flatHouseNo = 'Flat/House No. required';
    if (!form.society.trim()) e.society = 'Society/Building required';
    if (!form.pincode.trim() || form.pincode.length !== 6) e.pincode = 'Valid 6-digit Pincode required';
    if (!form.city.trim()) e.city = 'City required';
    if (!form.state.trim()) e.state = 'State required';
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
        
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[typography.label, { color: colors.text, marginBottom: spacing.sm }]}>Save address as</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {labels.map(l => (
              <TouchableOpacity 
                key={l}
                onPress={() => set('label')(l)}
                style={{ 
                  paddingHorizontal: spacing.md, 
                  paddingVertical: spacing.sm, 
                  borderRadius: radius.full, 
                  backgroundColor: form.label === l ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: form.label === l ? colors.primary : colors.border
                }}
              >
                <Text style={[typography.bodySmall, { color: form.label === l ? '#FFF' : colors.text }]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ThemedCard title="Address" style={{ marginBottom: spacing.md }}>
          <ThemedInput label="Flat / House No." value={form.flatHouseNo} onChangeText={set('flatHouseNo')} placeholder="e.g. B-402" error={errors.flatHouseNo} />
          <ThemedInput label="Society / Building Name" value={form.society} onChangeText={set('society')} placeholder="e.g. Sunrise Apartments" error={errors.society} />
          <ThemedInput label="Landmark (optional)" value={form.landmark} onChangeText={set('landmark')} placeholder="e.g. Near Metro Station" />
          <ThemedInput label="Pincode" value={form.pincode} onChangeText={set('pincode')} placeholder="e.g. 400001" keyboardType="numeric" error={errors.pincode} />
          <ThemedInput label="City" value={form.city} onChangeText={set('city')} placeholder="e.g. Mumbai" error={errors.city} />
          <StatePicker value={form.state} onSelect={set('state')} error={errors.state} />
        </ThemedCard>
        <ThemedButton label="Save Address" onPress={handleSave} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
