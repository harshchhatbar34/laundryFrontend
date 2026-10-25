import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { createServiceElement, updateServiceElement, getServices as getOwnerServices } from '../../api/owner';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerServiceStackParamList } from '../../navigation/OwnerTabs';

type Props = NativeStackScreenProps<OwnerServiceStackParamList, 'AddServiceElement'>;

interface ServiceItemRow {
  item: string;
  itemName: string;
  price: string;
}

export default function AddServiceElementScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { type = 'service', editItem } = route.params || {};
  const isEdit = !!editItem;

  const [form, setForm] = useState({
    name: editItem?.name || '',
    description: editItem?.description || '',
    price: editItem?.price?.toString() || '',
    discount: editItem?.discount?.toString() || '0',
  });
  const [loading, setLoading] = useState(false);

  // Master Items available to pick from
  const [masterItems, setMasterItems] = useState<any[]>([]);

  // Item rows configured for this service
  const [serviceItems, setServiceItems] = useState<ServiceItemRow[]>(() => {
    if (editItem?.items && Array.isArray(editItem.items)) {
      return editItem.items.map((si: any) => ({
        item: si.item?._id || si.item || '',
        itemName: si.item?.name || '',
        price: (si.price ?? '').toString(),
      }));
    }
    return [];
  });

  // Modal Picker state for selecting item on a specific row
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const titles: Record<string, string> = { service: 'Service', material: 'Material', item: 'Item', price: 'Price' };

  // Fetch all master items when on service screen
  useEffect(() => {
    if (type === 'service') {
      getOwnerServices({ hideLoader: true })
        .then((res: any) => {
          const items = res?.data?.items || [];
          setMasterItems(items);
        })
        .catch(() => {});
    }
  }, [type]);

  // Filter out items already selected in other rows
  const availablePickerItems = useMemo(() => {
    const selectedItemIds = new Set(
      serviceItems
        .filter((_, idx) => idx !== activeRowIndex)
        .map((si) => si.item)
        .filter(Boolean)
    );
    return masterItems.filter((it: any) => !selectedItemIds.has(it._id));
  }, [masterItems, serviceItems, activeRowIndex]);

  const openItemPicker = (rowIndex: number) => {
    setActiveRowIndex(rowIndex);
    setPickerVisible(true);
  };

  const handleSelectItem = (selected: any) => {
    if (activeRowIndex !== null) {
      setServiceItems((prev) => {
        const next = [...prev];
        next[activeRowIndex] = {
          item: selected._id,
          itemName: selected.name,
          price: next[activeRowIndex]?.price || (selected.price ?? 0).toString(),
        };
        return next;
      });
    }
    setPickerVisible(false);
    setActiveRowIndex(null);
  };

  const addRow = () => {
    const selectedCount = serviceItems.filter((si) => si.item).length;
    if (masterItems.length > 0 && selectedCount >= masterItems.length) {
      dispatch(showToast({ type: 'warning', message: 'All catalog items have already been added' }));
      return;
    }
    setServiceItems((prev) => [...prev, { item: '', itemName: '', price: '' }]);
  };

  const removeRow = (index: number) => {
    setServiceItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateRowPrice = (index: number, val: string) => {
    setServiceItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], price: val };
      return next;
    });
  };

  const handleSave = async () => {
    if (type !== 'price' && !form.name.trim()) {
      dispatch(showToast({ type: 'warning', message: 'Name is required' }));
      return;
    }
    setLoading(true);
    try {
      let data: any;

      if (type === 'price') {
        data = { price: parseFloat(form.price) || 0 };
      } else if (type === 'service') {
        const itemsPayload = serviceItems
          .filter((si) => si.item)
          .map((si) => ({
            item: si.item,
            price: parseFloat(si.price) || 0,
          }));

        data = {
          name: form.name.trim(),
          description: form.description.trim(),
          price: 0,
          discount: parseFloat(form.discount) || 0,
          items: itemsPayload,
        };
      } else {
        data = {
          name: form.name.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price) || 0,
        };
      }

      if (isEdit) await updateServiceElement(editItem._id, type, data);
      else await createServiceElement(type, data);

      dispatch(showToast({ type: 'success', message: `${titles[type]} saved successfully` }));
      navigation.goBack();
    } catch (e: any) {
      dispatch(showToast({ type: 'error', message: e?.message || 'Failed to save' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header title={`${isEdit ? 'Edit' : 'Add'} ${titles[type]}`} showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
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

          {type !== 'service' && (
            <Input
              key="price-input"
              label="Price (₹)"
              value={form.price}
              onChangeText={(v) => set('price', v)}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
              icon="cash-outline"
            />
          )}

          {type === 'service' && (
            <Input
              key="discount-input"
              label="Discount (%)"
              value={form.discount}
              onChangeText={(v) => set('discount', v)}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
              icon="pricetag-outline"
            />
          )}

          {/* Service Item Pricing Section */}
          {type === 'service' && (
            <View style={[styles.pricingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {/* Header */}
              <View style={styles.pricingHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="pricetag-outline" size={17} color={theme.colors.primary} />
                    <Text style={[theme.typography.label, { color: theme.colors.textPrimary, fontSize: 16 }]}>
                      Item Pricing
                    </Text>
                    {serviceItems.length > 0 && (
                      <View style={[styles.badge, { backgroundColor: theme.colors.primaryBg }]}>
                        <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                          {serviceItems.length}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                    Set custom prices for clothes under this service
                  </Text>
                </View>

                {serviceItems.length > 0 && (
                  <TouchableOpacity
                    onPress={addRow}
                    style={[styles.miniAddBtn, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.primary + '30' }]}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={16} color={theme.colors.primary} />
                    <Text style={[styles.miniAddText, { color: theme.colors.primary }]}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Column Labels */}
              {serviceItems.length > 0 && (
                <View style={styles.colHeaderRow}>
                  <Text style={[styles.colHeader, { flex: 1.6, color: theme.colors.textSecondary }]}>Item</Text>
                  <Text style={[styles.colHeader, { width: 104, color: theme.colors.textSecondary, textAlign: 'center' }]}>
                    Price (₹)
                  </Text>
                  <View style={{ width: 34 }} />
                </View>
              )}

              {/* Rows */}
              {serviceItems.map((row, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.itemRowCard,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.borderLight,
                    },
                  ]}
                >
                  {/* Item Dropdown */}
                  <TouchableOpacity
                    style={[
                      styles.itemPickerBtn,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => openItemPicker(idx)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="shirt-outline"
                      size={15}
                      color={row.itemName ? theme.colors.primary : theme.colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        theme.typography.bodySmall,
                        {
                          color: row.itemName ? theme.colors.textPrimary : theme.colors.textMuted,
                          fontWeight: row.itemName ? '600' : '400',
                          flex: 1,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {row.itemName || 'Select Item'}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={theme.colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Price Input with Currency prefix */}
                  <View
                    style={[
                      styles.priceInputWrapper,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.currencyPrefix, { color: theme.colors.textSecondary }]}>₹</Text>
                    <TextInput
                      style={[
                        styles.priceInput,
                        {
                          color: theme.colors.textPrimary,
                        },
                      ]}
                      placeholder="0"
                      placeholderTextColor={theme.colors.placeholder}
                      keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                      value={row.price}
                      onChangeText={(val) => updateRowPrice(idx, val)}
                    />
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity
                    onPress={() => removeRow(idx)}
                    style={[styles.deleteBtn, { backgroundColor: theme.colors.errorBg }]}
                    hitSlop={theme.hitSlop}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={15} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Empty State */}
              {serviceItems.length === 0 && (
                <View style={[styles.emptyBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.borderLight }]}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: theme.colors.primaryBg }]}>
                    <Ionicons name="pricetags-outline" size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={[theme.typography.label, { color: theme.colors.textPrimary, marginTop: 10 }]}>
                    No items added yet
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4, maxWidth: 240 }]}>
                    Add clothes from your catalog to set custom prices for this service
                  </Text>
                  <TouchableOpacity
                    onPress={addRow}
                    style={[styles.emptyAddBtn, { backgroundColor: theme.colors.primary }]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={18} color="#FFF" />
                    <Text style={[theme.typography.label, { color: '#FFF', marginLeft: 6 }]}>
                      Add Item
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Bottom Add Row Button */}
              {serviceItems.length > 0 && (
                <TouchableOpacity
                  onPress={addRow}
                  style={[
                    styles.bottomAddBtn,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceVariant,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
                  <Text style={[theme.typography.label, { color: theme.colors.primary, marginLeft: 6, fontSize: 13 }]}>
                    Add Another Item
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Button
            title={isEdit ? 'Update' : 'Create'}
            onPress={handleSave}
            loading={loading}
            icon="checkmark-outline"
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Item Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Select Item</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  Choose a clothing item to add to this service
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPickerVisible(false)} hitSlop={theme.hitSlop}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
              {availablePickerItems.length === 0 ? (
                <View style={{ paddingVertical: 28, alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle-outline" size={36} color={theme.colors.primary} />
                  <Text style={[theme.typography.label, { color: theme.colors.textPrimary, marginTop: 8 }]}>
                    All items added
                  </Text>
                  <Text style={[theme.typography.caption, { textAlign: 'center', marginTop: 4, color: theme.colors.textMuted }]}>
                    {masterItems.length === 0 ? 'No items found in catalog' : 'All clothes from your catalog have already been added'}
                  </Text>
                </View>
              ) : (
                availablePickerItems.map((it: any) => (
                  <TouchableOpacity
                    key={it._id}
                    style={[styles.pickerOptionRow, { borderBottomColor: theme.colors.divider }]}
                    onPress={() => handleSelectItem(it)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={[styles.pickerItemIcon, { backgroundColor: theme.colors.primaryBg }]}>
                        <Ionicons name="shirt-outline" size={18} color={theme.colors.primary} />
                      </View>
                      <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '500', flex: 1 }]}>
                        {it.name}
                      </Text>
                    </View>
                    {it.price != null && (
                      <View style={[styles.pickerDefaultBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={[theme.typography.captionSmall, { color: theme.colors.textSecondary, fontWeight: '600' }]}>
                          Default ₹{it.price}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  pricingCard: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  miniAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  miniAddText: {
    fontSize: 12,
    fontWeight: '700',
  },
  colHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 6,
    gap: 8,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  itemPickerBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
  },
  priceInputWrapper: {
    width: 104,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 14,
  },
  bottomAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '65%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerDefaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
