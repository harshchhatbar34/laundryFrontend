import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { createServiceElement, updateServiceElement } from '../../api/owner';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerServiceStackParamList } from '../../navigation/OwnerTabs';

type Props = NativeStackScreenProps<OwnerServiceStackParamList, 'AddServiceElement'>;

export default function AddServiceElementScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { type = 'service', editItem } = route.params || {};
  const isEdit = !!editItem;
  const [form, setForm] = useState({ name: editItem?.name || '', description: editItem?.description || '', price: editItem?.price?.toString() || '' });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const titles: Record<string, string> = { service: 'Service', material: 'Material', item: 'Item', price: 'Price' };

  const handleSave = async () => {
    if (type !== 'price' && !form.name.trim()) { dispatch(showToast({ type: 'warning', message: 'Name is required' })); return; }
    setLoading(true);
    try {
      const data = type === 'price' 
        ? { price: parseFloat(form.price) || 0 } 
        : { name: form.name.trim(), description: form.description.trim(), price: parseFloat(form.price) || 0 };
        
      if (isEdit) await updateServiceElement(editItem._id, type, data);
      else await createServiceElement(type, data);
      navigation.goBack();
    } catch (e) { dispatch(showToast({ type: 'error', message: 'Failed to save' })); }
    finally { setLoading(false); }
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header title={`${isEdit ? 'Edit' : 'Add'} ${titles[type]}`} showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {type !== 'price' && (
            <Input
              key="name-input"
              label="Name"
              value={form.name}
              onChangeText={(v) => set('name', v)}
            />
          )}
          {type === 'service' && (
            <Input
              key="desc-input"
              label="Description"
              value={form.description}
              onChangeText={(v) => set('description', v)}
              multiline
            />
          )}
          <Input
            key="price-input"
            label={type === 'service' ? 'Base Price (₹)' : 'Price (₹)'}
            value={form.price}
            onChangeText={(v) => set('price', v)}
            keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
            icon="cash-outline"
          />
          <Button title={isEdit ? 'Update' : 'Create'} onPress={handleSave} loading={loading} icon="checkmark-outline" style={{ marginTop: 12 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
