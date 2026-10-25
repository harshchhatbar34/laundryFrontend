import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import { useTheme } from '../../theme/ThemeContext';
import { addToCart } from '../../store/slices/orderSlice';
import { showToast } from '../../store/slices/uiSlice';
import { formatPrice } from '../../utils/helpers';
import { SERVICE_ICONS } from '../../utils/constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/CustomerTabs';
import { AppDispatch } from '../../store';

type Props = NativeStackScreenProps<HomeStackParamList, 'BranchCatalog'>;

export default function BranchCatalogScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { branch, masters } = route.params;

  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Extract services and master items
  const services = useMemo(() => masters?.services || [], [masters]);
  const allMasterItems = useMemo(() => (masters?.items || []).filter((i: any) => i.isActive), [masters]);

  // Dynamically compute items available for the selected service
  const availableItems = useMemo(() => {
    if (!selectedService) return [];

    const discount = selectedService.discount || 0;

    // If service has specific items configured in its items array
    if (selectedService.items && Array.isArray(selectedService.items) && selectedService.items.length > 0) {
      return selectedService.items
        .filter((si: any) => si.isActive !== false)
        .map((si: any) => {
          const itemObj = si.item?._id
            ? si.item
            : allMasterItems.find((it: any) => it._id === (si.item?._id || si.item));
          const basePrice = si.price != null ? si.price : (itemObj?.price || 0);
          const finalPrice = discount > 0 ? Math.max(0, Math.round(basePrice * (1 - discount / 100))) : basePrice;

          return {
            _id: itemObj?._id || si.item,
            name: itemObj?.name || 'Item',
            price: finalPrice,
            basePrice,
            discount,
          };
        });
    }

    // Fallback: If service has no specific items configured, show all master items
    return allMasterItems.map((it: any) => {
      const basePrice = it.price || 0;
      const finalPrice = discount > 0 ? Math.max(0, Math.round(basePrice * (1 - discount / 100))) : basePrice;
      return {
        _id: it._id,
        name: it.name,
        price: finalPrice,
        basePrice,
        discount,
      };
    });
  }, [selectedService, allMasterItems]);

  // Display-only estimated price
  const estimatedPrice = useMemo(() => {
    if (!selectedItem) return 0;
    return selectedItem.price || 0;
  }, [selectedItem]);

  const handleAddToCart = () => {
    if (!selectedService) {
      dispatch(showToast({ type: 'warning', message: 'Please select a service' }));
      return;
    }
    if (!selectedItem) {
      dispatch(showToast({ type: 'warning', message: 'Please select a cloth' }));
      return;
    }

    dispatch(
      addToCart({
        service: selectedService._id,
        serviceName: selectedService.name,
        item: selectedItem._id,
        itemName: selectedItem.name,
        quantity,
        price: estimatedPrice, // display-only estimate; backend recalculates real price from DB
        name: selectedItem.name,
      })
    );

    dispatch(
      showToast({
        type: 'success',
        message: `${quantity} x ${selectedItem.name} (${selectedService.name}) added to cart`,
      })
    );

    // Reset all selections for next item
    setSelectedService(null);
    setSelectedItem(null);
    setQuantity(1);
  };

  return (
    <ScreenWrapper edges={[]}>      
      <Header
        title={branch?.name || 'Branch Catalog'}
        subtitle={`${branch?.addressLine || ''}, ${branch?.city || ''}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Navigate to Branch Banner */}
      <TouchableOpacity
        style={[styles.navigateBanner, { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary + '30' }]}
        onPress={() => navigation.navigate('BranchNavigation', { branch })}
        activeOpacity={0.75}
      >
        <Ionicons name="navigate-circle" size={22} color={theme.colors.primary} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.navigateTitle, { color: theme.colors.primary }]}>Navigate to this branch</Text>
          <Text style={[styles.navigateSub, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {branch?.addressLine}, {branch?.city}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* 1. Select Service */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>1. Select Service</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {services.map((s: any) => {
            const isSelected = selectedService?._id === s._id;
            const emoji = (SERVICE_ICONS as any)[s.name] || (SERVICE_ICONS as any).default;
            const discountLabel = s.discount && s.discount > 0 ? ` · ${s.discount}% OFF` : '';
            return (
              <Chip
                key={s._id}
                label={`${emoji} ${s.name}${discountLabel}`}
                selected={isSelected}
                onPress={() => {
                  setSelectedService(s);
                  setSelectedItem(null);
                }}
                style={styles.chip}
              />
            );
          })}
        </ScrollView>

        {/* 2. Select Cloth */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: 20 }]}>2. Select Cloth</Text>
        {!selectedService ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginHorizontal: 16, marginTop: 4 }]}>
            👆 Please select a service first to view available clothes & prices.
          </Text>
        ) : availableItems.length === 0 ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginHorizontal: 16, marginTop: 4 }]}>
            No clothes configured for {selectedService.name}.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {availableItems.map((item: any) => {
              const isSelected = selectedItem?._id === item._id;
              return (
                <Chip
                  key={item._id}
                  label={`${item.name} (₹${item.price})`}
                  selected={isSelected}
                  onPress={() => setSelectedItem(item)}
                  style={styles.chip}
                />
              );
            })}
          </ScrollView>
        )}

        {/* 3. Selection Summary and Add to Cart */}
        {selectedService && selectedItem && (
          <Card style={[styles.summaryCard, { borderColor: theme.colors.primary }]} padding="medium">
            <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>Selection Summary</Text>
            <View style={styles.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
                  {selectedItem.name}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  Service: {selectedService.name}
                </Text>
                {selectedItem.discount > 0 && selectedItem.basePrice !== selectedItem.price && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.textMuted, textDecorationLine: 'line-through' }}>
                      ₹{selectedItem.basePrice}
                    </Text>
                    <View style={{ backgroundColor: theme.colors.success + '20', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: theme.colors.success }}>
                        {selectedItem.discount}% OFF
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <Text style={[theme.typography.price, { color: theme.colors.primary }]}>
                {formatPrice(estimatedPrice * quantity)}
              </Text>
            </View>

            <View style={styles.actionRow}>
              {/* Stepper */}
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  <Ionicons name="remove" size={18} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: theme.colors.textPrimary }]}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => q + 1)}
                  style={[styles.stepBtn, { backgroundColor: theme.colors.primary }]}
                >
                  <Ionicons name="add" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              <Button
                title="Add to Cart"
                onPress={handleAddToCart}
                icon="cart-outline"
                style={styles.addBtn}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 60 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, fontFamily: 'System' },
  horizontalScroll: { paddingBottom: 4 },
  chip: { marginRight: 8, height: 40, borderRadius: 20 },
  navigateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  navigateTitle: { fontSize: 13, fontWeight: '700' },
  navigateSub: { fontSize: 11, marginTop: 1 },
  summaryCard: {
    marginTop: 24,
    borderWidth: 2,
    borderRadius: 16,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 16, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  addBtn: { flex: 1, marginLeft: 16 },
});
