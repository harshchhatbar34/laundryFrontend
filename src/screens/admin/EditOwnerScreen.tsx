import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, KeyboardAvoidingView,
  Platform, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import Divider from '../../components/ui/Divider';
import { useTheme } from '../../theme/ThemeContext';
import { getOwnerDetails, updateOwner } from '../../api/admin';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminOwnerStackParamList } from '../../navigation/AdminTabs';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Avatar from '../../components/ui/Avatar';
import StateDropdown from '../../components/ui/StateDropdown';
import CityDropdown from '../../components/ui/CityDropdown';
import PincodeDropdown from '../../components/ui/PincodeDropdown';

type Props = NativeStackScreenProps<AdminOwnerStackParamList, 'EditOwner'>;

interface FormState {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  laundryName: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  paymentAmount: string;
  paymentMode: string;
  subscription: string;
  photo?: string;
  upiId: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  password: '',
  mobileNumber: '',
  laundryName: '',
  address: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  paymentAmount: '',
  paymentMode: 'cash',
  subscription: 'monthly',
  photo: '',
  upiId: '',
};

export default function EditOwnerScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { ownerId } = route.params;

  const { user } = useSelector((s: any) => s.auth);
  const superAdminUpi = user?.upiId;

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FormState, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  // Load current owner details on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOwnerDetails(ownerId);
        const owner = res?.data?.owner;
        const tenant = owner?.tenant;
        if (owner) {
          setForm({
            name: owner.name || '',
            email: owner.email || '',
            password: '',                          // never pre-fill password
            mobileNumber: owner.mobileNumber || '',
            laundryName: tenant?.laundryName || '',
            address: tenant?.address || '',
            landmark: tenant?.landmark || '',
            city: tenant?.city || '',
            state: tenant?.state || '',
            pincode: tenant?.pincode || '',
            paymentAmount: tenant?.paymentAmount ? String(tenant.paymentAmount) : '',
            paymentMode: tenant?.paymentMode || 'cash',
            subscription: tenant?.subscription || 'monthly',
            photo: owner.photo || '',
            upiId: tenant?.upiId || '',
          });
        }
      } catch (e) {
        dispatch(showToast({ type: 'error', message: 'Failed to load owner details' }));
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ownerId]);

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
    if (!form.name.trim() || !form.email.trim()) {
      dispatch(showToast({ type: 'warning', message: 'Name and Email are required.' }));
      return;
    }

    const amountStr = form.paymentAmount.trim();
    if (amountStr && (isNaN(Number(amountStr)) || Number(amountStr) <= 0)) {
      dispatch(showToast({ type: 'warning', message: 'Payment amount must be a valid positive number.' }));
      return;
    }

    // Build payload — only send non-empty values
    const payload: Record<string, any> = {
      name: form.name.trim(),
      email: form.email.trim(),
      mobileNumber: form.mobileNumber.trim() || null,
      laundryName: form.laundryName.trim() || undefined,
      address: form.address.trim() || null,
      landmark: form.landmark.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      pincode: form.pincode.trim() || null,
      paymentMode: form.paymentMode || undefined,
      subscription: form.subscription || undefined,
      photo: form.photo || null,
      upiId: form.upiId.trim() || null,
    };

    if (amountStr) payload.paymentAmount = Number(amountStr);
    if (form.password.trim()) payload.password = form.password.trim();

    setSaving(true);
    try {
      await updateOwner(ownerId, payload);
      navigation.goBack();
    } catch (e: any) {
      dispatch(showToast({ type: 'error', message: e?.response?.data?.message || 'Failed to update owner. Please try again.' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper edges={[]}>
        <Header title="Edit Owner" showBack onBack={() => navigation.goBack()} />
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 14 }]}>
            Loading owner data...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Edit Owner" showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
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

          {/* ── Account Info ───────────────────────────── */}
          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 12 }]}>
            Account Info
          </Text>

          <Input
            label="Name *"
            value={form.name}
            onChangeText={v => set('name', v)}
            icon="person-outline"
          />
          <Input
            label="Email *"
            value={form.email}
            onChangeText={v => set('email', v)}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="New Password (leave blank to keep current)"
            value={form.password}
            onChangeText={v => set('password', v)}
            icon="lock-closed-outline"
            secureTextEntry
          />
          <Input
            label="Mobile Number"
            value={form.mobileNumber}
            onChangeText={v => set('mobileNumber', v)}
            icon="call-outline"
            keyboardType="phone-pad"
          />

          <Divider spacing={16} />

          {/* ── Laundry Shop ───────────────────────────── */}
          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 12 }]}>
            Laundry Shop Setup
          </Text>

          <Input
            label="Laundry Brand Name"
            value={form.laundryName}
            onChangeText={v => set('laundryName', v)}
            icon="business-outline"
          />
          <Input
            label="Street / Shop Address"
            value={form.address}
            onChangeText={v => set('address', v)}
            icon="location-outline"
          />
          <Input
            label="Landmark (optional)"
            value={form.landmark}
            onChangeText={v => set('landmark', v)}
            icon="navigate-outline"
          />
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <StateDropdown
                label="State"
                selectedState={form.state}
                onSelect={selected => {
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
                onSelect={selected => {
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
            onSelect={selected => set('pincode', selected)}
          />

          <Divider spacing={16} />

          {/* ── Subscription ──────────────────────────── */}
          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 12 }]}>
            Subscription & Billing
          </Text>

          <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
            Subscription Plan
          </Text>
          <View style={styles.chipRow}>
            {(['monthly', 'yearly', 'onetime'] as const).map(s => (
              <Chip
                key={s}
                label={s.toUpperCase()}
                selected={form.subscription === s}
                onPress={() => set('subscription', s)}
                style={{ marginRight: 8, marginBottom: 8 }}
              />
            ))}
          </View>

          <Input
            label="Subscription Fee Amount"
            value={form.paymentAmount}
            onChangeText={v => set('paymentAmount', v)}
            icon="cash-outline"
            keyboardType="numeric"
          />

          <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginTop: 4, marginBottom: 8 }]}>
            Payment Mode
          </Text>
          <View style={styles.chipRow}>
            {(['cash', 'upi'] as const).map(m => (
              <Chip
                key={m}
                label={m.toUpperCase()}
                selected={form.paymentMode === m}
                onPress={() => set('paymentMode', m)}
                style={{ marginRight: 8, marginBottom: 8 }}
              />
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
            onChangeText={v => set('upiId', v)}
            icon="qr-code-outline"
            placeholder="e.g. ownername@upi"
            autoCapitalize="none"
            style={{ marginTop: 16 }}
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            icon="checkmark-outline"
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centeredLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
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
