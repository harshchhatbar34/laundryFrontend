import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import { useTheme } from '../../theme/ThemeContext';
import { createCoupon, updateCoupon } from '../../api/admin';

interface AddCouponScreenProps {
  route: any;
  navigation: any;
}

export default function AddCouponScreen({ route, navigation }: AddCouponScreenProps) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { editItem } = route.params || {};
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    code: editItem?.code || '',
    discountType: editItem?.discountType || 'percentage',
    discountValue: editItem?.discountValue?.toString() || '',
    validUntil: editItem?.validUntil?.split('T')[0] || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.code.trim() || !form.discountValue) {
      dispatch(showToast({ type: 'warning', message: 'Code and value are required' }));
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...form,
        discountValue: parseFloat(form.discountValue),
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      };
      if (isEdit) {
        await updateCoupon(editItem._id, data);
      } else {
        await createCoupon(data);
      }
      navigation.goBack();
    } catch (e) {
      dispatch(showToast({ type: 'error', message: 'Failed to save coupon' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header title={isEdit ? 'Edit Coupon' : 'Add Coupon'} showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Input label="Coupon Code" value={form.code} onChangeText={(v) => set('code', v)} icon="pricetag-outline" autoCapitalize="characters" />
          <Text style={[theme.typography.label, { color: theme.colors.textPrimary, marginBottom: 8 }]}>Discount Type</Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <Chip label="Percentage (%)" selected={form.discountType === 'percentage'} onPress={() => set('discountType', 'percentage')} style={{ marginRight: 8 }} />
            <Chip label="Fixed (₹)" selected={form.discountType === 'fixed'} onPress={() => set('discountType', 'fixed')} />
          </View>
          <Input label={form.discountType === 'percentage' ? 'Discount (%)' : 'Discount (₹)'} value={form.discountValue}
            onChangeText={(v) => set('discountValue', v)} keyboardType="decimal-pad" icon="cash-outline" />
          <Input label="Valid Until (YYYY-MM-DD)" value={form.validUntil} onChangeText={(v) => set('validUntil', v)} icon="calendar-outline" />
          <Button title={isEdit ? 'Update Coupon' : 'Create Coupon'} onPress={handleSave} loading={loading} icon="checkmark-outline" style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
