import React, { useState } from 'react';
import { ScrollView, View, Text, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import { useTheme } from '../../theme/ThemeContext';
import { createOwner } from '../../api/admin';
import { showToast } from '../../store/slices/uiSlice';
import * as ImagePicker from 'expo-image-picker';
import StateDropdown from '../../components/ui/StateDropdown';
import CityDropdown from '../../components/ui/CityDropdown';
import PincodeDropdown from '../../components/ui/PincodeDropdown';
import Avatar from '../../components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';

interface CreateOwnerScreenProps {
  navigation: any;
}

export default function CreateOwnerScreen({ navigation }: CreateOwnerScreenProps) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((s: any) => s.auth);
  const superAdminUpi = user?.upiId;

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    laundryName: '',
    paymentAmount: '',
    subscription: 'monthly',
    mobileNumber: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    paymentMode: 'cash',
    photo: '',
    upiId: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        dispatch(showToast({ type: 'warning', message: 'Permission to access gallery is required' }));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          set('photo', `data:image/jpeg;base64,${asset.base64}`);
        } else if (asset.uri) {
          set('photo', asset.uri);
        }
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: 'Failed to pick image' }));
    }
  };

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.laundryName.trim() ||
      !form.paymentAmount.trim() ||
      !form.subscription
    ) {
      dispatch(showToast({ type: 'warning', message: 'Please fill in all required fields' }));
      return;
    }

    const amount = Number(form.paymentAmount.trim());
    if (isNaN(amount) || amount <= 0) {
      dispatch(showToast({ type: 'warning', message: 'Payment amount must be a valid positive number' }));
      return;
    }

    setLoading(true);
    try {
      await createOwner({
        ...form,
        paymentAmount: amount,
        mobileNumber: form.mobileNumber.trim() || null,
        address: form.address.trim() || null,
        landmark: form.landmark.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        pincode: form.pincode.trim() || null,
        photo: form.photo || null,
        upiId: form.upiId.trim() || null,
      });
      // Toast is auto-fired by the API interceptor on success
      navigation.goBack();
    } catch (e: any) {
      // Error toast is also auto-fired by the API interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Create Owner" showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          
          {/* Photo Section */}
          <View style={styles.photoContainer}>
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.avatarWrapper}>
              <Avatar name={form.name || 'Owner'} imageUrl={form.photo} size={100} />
              <View style={[styles.cameraBadge, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="camera" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 8 }]}>
              {form.photo ? 'Tap to change photo' : 'Upload Owner Photo'}
            </Text>
          </View>

          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 12 }]}>Owner Account Info</Text>
          <Input label="Name *" value={form.name} onChangeText={(v) => set('name', v)} icon="person-outline" />
          <Input label="Email *" value={form.email} onChangeText={(v) => set('email', v)} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password *" value={form.password} onChangeText={(v) => set('password', v)} icon="lock-closed-outline" secureTextEntry />
          <Input label="Mobile Number" value={form.mobileNumber} onChangeText={(v) => set('mobileNumber', v)} icon="call-outline" keyboardType="phone-pad" />

          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginTop: 16, marginBottom: 12 }]}>Laundry Shop Setup</Text>
          <Input label="Laundry Brand Name *" value={form.laundryName} onChangeText={(v) => set('laundryName', v)} icon="business-outline" />
          <Input label="Shop Address" value={form.address} onChangeText={(v) => set('address', v)} icon="location-outline" />
          <Input label="Landmark" value={form.landmark} onChangeText={(v) => set('landmark', v)} icon="location-outline" />
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <StateDropdown
                label="State"
                selectedState={form.state}
                onSelect={(selected) => {
                  set('state', selected);
                  set('city', '');
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CityDropdown
                label="City"
                selectedState={form.state}
                selectedCity={form.city}
                onSelect={(selected) => {
                  set('city', selected);
                  set('pincode', '');
                }}
              />
            </View>
          </View>
          <PincodeDropdown
            label="Pincode"
            selectedCity={form.city}
            selectedPincode={form.pincode}
            onSelect={(selected) => set('pincode', selected)}
          />

          <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginTop: 12, marginBottom: 8 }]}>Subscription Plan *</Text>
          <View style={styles.chipRow}>
            {['monthly', 'yearly', 'onetime'].map((s) => (
              <Chip key={s} label={s.toUpperCase()} selected={form.subscription === s} onPress={() => set('subscription', s)} style={{ marginRight: 8 }} />
            ))}
          </View>

          <Input label="Payment Subscription Fee *" value={form.paymentAmount} onChangeText={(v) => set('paymentAmount', v)} icon="cash-outline" keyboardType="numeric" />

          <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginTop: 16, marginBottom: 8 }]}>Payment Mode</Text>
          <View style={styles.chipRow}>
            {['cash', 'upi'].map((m) => (
              <Chip key={m} label={m.toUpperCase()} selected={form.paymentMode === m} onPress={() => set('paymentMode', m)} style={{ marginRight: 8 }} />
            ))}
          </View>

          {form.paymentMode === 'upi' && (
            superAdminUpi ? (
              <View style={[styles.upiNote, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.primary }]}>
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary} />
                <Text style={[theme.typography.bodySmall, { color: theme.colors.primary, flex: 1, marginLeft: 6 }]}>
                  Collect subscription payment to your UPI ID: <Text style={{ fontWeight: '700' }}>{superAdminUpi}</Text>
                </Text>
              </View>
            ) : (
              <View style={[styles.upiNote, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.error }]}>
                <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
                <Text style={[theme.typography.bodySmall, { color: theme.colors.error, flex: 1, marginLeft: 6 }]}>
                  Note: You have not set your SuperAdmin UPI ID in Profile settings yet.
                </Text>
              </View>
            )
          )}

          <Input
            label="Owner Shop UPI ID"
            value={form.upiId}
            onChangeText={(v) => set('upiId', v)}
            icon="qr-code-outline"
            placeholder="e.g. ownername@upi"
            autoCapitalize="none"
            style={{ marginTop: 16 }}
          />

          <Button title="Create" onPress={handleSave} loading={loading} icon="business-outline" style={{ marginTop: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  upiNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
});
