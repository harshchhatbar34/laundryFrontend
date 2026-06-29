import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Chip from '../../components/ui/Chip';
import StateDropdown from '../../components/ui/StateDropdown';
import CityDropdown from '../../components/ui/CityDropdown';
import PincodeDropdown from '../../components/ui/PincodeDropdown';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { addAddress } from '../../api/user';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/CustomerTabs';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddAddress'>;

export default function AddAddressScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ label: 'Home', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', lat: '23.0225', lng: '72.5714' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ addressLine1?: string; city?: string; state?: string; pincode?: string }>({});
  
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const e: { addressLine1?: string; city?: string; state?: string; pincode?: string } = {};
    if (!form.addressLine1.trim()) e.addressLine1 = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (!form.pincode.trim()) e.pincode = 'Required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await addAddress({ ...form, location: { coordinates: [parseFloat(form.lng) || 72.5714, parseFloat(form.lat) || 23.0225] } });
      navigation.goBack();
    } catch (err: any) { 
      dispatch(showToast({ type: 'error', message: err?.response?.data?.message || 'Failed to save address' })); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Add Address" showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          
          {/* Address Label Selector */}
          <Text style={[theme.typography.labelSmall, { color: theme.colors.textSecondary, marginBottom: 8, marginLeft: 4 }]}>
            Address Label
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            <Chip
              label="Home"
              selected={form.label === 'Home'}
              onPress={() => set('label', 'Home')}
              icon="home-outline"
            />
            <Chip
              label="Office"
              selected={form.label === 'Office'}
              onPress={() => set('label', 'Office')}
              icon="briefcase-outline"
            />
          </View>

          <Input label="Address Line 1" value={form.addressLine1} onChangeText={(v) => set('addressLine1', v)} icon="location-outline" error={errors.addressLine1} />
          <Input label="Address Line 2" value={form.addressLine2} onChangeText={(v) => set('addressLine2', v)} />
          
          {/* Indian States Dropdown */}
          <StateDropdown
            label="State"
            selectedState={form.state}
            onSelect={(selected) => {
              set('state', selected);
              set('city', '');
            }}
            error={errors.state}
          />

          {/* Cities Dropdown */}
          <CityDropdown
            label="City"
            selectedState={form.state}
            selectedCity={form.city}
            onSelect={(selected) => {
              set('city', selected);
              set('pincode', '');
            }}
            error={errors.city}
          />

          {/* Pincode Dropdown */}
          <PincodeDropdown
            label="Pincode"
            selectedCity={form.city}
            selectedPincode={form.pincode}
            onSelect={(selected) => set('pincode', selected)}
            error={errors.pincode}
          />
          
          <Button title="Save Address" onPress={handleSave} loading={loading} icon="checkmark-outline" style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

