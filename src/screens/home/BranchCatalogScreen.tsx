import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
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

  const scrollRef = useRef<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
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
      dispatch(showToast({ type: 'warning', message: 'Please select an item' }));
      return;
    }

    dispatch(
      addToCart({
        service: selectedService._id,
        serviceName: selectedService.name,
        item: selectedItem._id,
        itemName: selectedItem.name,
        quantity,
        price: estimatedPrice,
        name: selectedItem.name,
      })
    );

    dispatch(
      showToast({
        type: 'success',
        message: `${quantity} x ${selectedItem.name} (${selectedService.name}) added to cart`,
      })
    );

    // Reset selections for next item
    setSelectedService(null);
    setServiceDropdownOpen(false);
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
      
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Service Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {selectedService ? 'Selected Service' : '1. Select Service'}
          </Text>
          {!selectedService && (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {services.length} services available
            </Text>
          )}
        </View>

        {/* When a service is selected: Show Dropdown Selector */}
        {selectedService ? (
          <View style={{ marginBottom: 4 }}>
            <TouchableOpacity
              style={[
                styles.serviceDropdownTrigger,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: serviceDropdownOpen ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setServiceDropdownOpen(!serviceDropdownOpen)}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceEmojiCircle, { backgroundColor: theme.colors.primaryBg }]}>
                <Text style={styles.serviceEmoji}>
                  {(SERVICE_ICONS as any)[selectedService.name] || '🧺'}
                </Text>
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Current Service
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 1 }}>
                  <Text style={[styles.selectedServiceName, { color: theme.colors.textPrimary }]}>
                    {selectedService.name}
                  </Text>
                  {selectedService.discount > 0 && (
                    <View style={[styles.discountTag, { backgroundColor: theme.colors.successBg }]}>
                      <Text style={[styles.discountTagText, { color: theme.colors.success }]}>
                        {selectedService.discount}% OFF
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Dropdown Chevron Icon */}
              <View style={[styles.dropdownIconCircle, { backgroundColor: theme.colors.primaryBg }]}>
                <Ionicons
                  name={serviceDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
            </TouchableOpacity>

            {/* Expanded Dropdown Options to easily switch services */}
            {serviceDropdownOpen && (
              <View
                style={[
                  styles.dropdownMenu,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.dropdownMenuTitle, { color: theme.colors.textSecondary }]}>
                  Select another service:
                </Text>
                {services.map((s: any) => {
                  const isCurrent = selectedService?._id === s._id;
                  const emoji = (SERVICE_ICONS as any)[s.name] || (SERVICE_ICONS as any).default || '🧺';
                  const hasDiscount = s.discount && s.discount > 0;

                  return (
                    <TouchableOpacity
                      key={s._id}
                      style={[
                        styles.dropdownOptionRow,
                        isCurrent && { backgroundColor: theme.colors.primaryBg },
                      ]}
                      onPress={() => {
                        setSelectedService(s);
                        setSelectedItem(null);
                        setServiceDropdownOpen(false);
                        setTimeout(() => {
                          scrollRef.current?.scrollTo({ y: 0, animated: true });
                        }, 50);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.optionEmojiCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={{ fontSize: 18 }}>{emoji}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={[
                            styles.dropdownOptionName,
                            {
                              color: isCurrent ? theme.colors.primary : theme.colors.textPrimary,
                              fontWeight: isCurrent ? '700' : '600',
                            },
                          ]}
                        >
                          {s.name}
                        </Text>
                        {hasDiscount && (
                          <Text style={{ fontSize: 11, color: theme.colors.success, fontWeight: '700' }}>
                            {s.discount}% discount applied
                          </Text>
                        )}
                      </View>
                      {isCurrent ? (
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                      ) : (
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          /* When NO service is selected: Keep the current Select Service grid */
          <View style={styles.serviceGrid}>
            {services.map((s: any) => {
              const emoji = (SERVICE_ICONS as any)[s.name] || (SERVICE_ICONS as any).default || '🧺';
              const hasDiscount = s.discount && s.discount > 0;
              return (
                <TouchableOpacity
                  key={s._id}
                  style={[
                    styles.serviceCard,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  ]}
                  onPress={() => {
                    setSelectedService(s);
                    setServiceDropdownOpen(false);
                    setSelectedItem(null);
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({ y: 0, animated: true });
                    }, 50);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.serviceEmojiCircle, { backgroundColor: theme.colors.primaryBg }]}>
                    <Text style={styles.serviceEmoji}>{emoji}</Text>
                  </View>
                  <Text style={[styles.serviceCardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                    {s.name}
                  </Text>
                  {hasDiscount ? (
                    <View style={[styles.discountTag, { backgroundColor: theme.colors.successBg, marginTop: 4 }]}>
                      <Text style={[styles.discountTagText, { color: theme.colors.success }]}>
                        {s.discount}% OFF
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.serviceCardHint, { color: theme.colors.textMuted }]}>
                      Tap to select
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 2. Select Items — ONLY SHOWN WHEN A SERVICE IS SELECTED */}
        {selectedService && (
          <View style={{ marginTop: 24 }}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                2. Select Items
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                {availableItems.length} items for {selectedService.name}
              </Text>
            </View>

            {availableItems.length === 0 ? (
              <Card style={{ marginTop: 8 }} padding="medium">
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, textAlign: 'center' }]}>
                  No items configured for {selectedService.name}.
                </Text>
              </Card>
            ) : (
              <View style={styles.clothGrid}>
                {availableItems.map((item: any) => {
                  const isSelected = selectedItem?._id === item._id;
                  return (
                    <TouchableOpacity
                      key={item._id}
                      style={[
                        styles.clothCard,
                        {
                          backgroundColor: isSelected ? theme.colors.primaryBg : theme.colors.surface,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => {
                        // Tapping again deselects item
                        if (isSelected) {
                          setSelectedItem(null);
                        } else {
                          setSelectedItem(item);
                        }
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={styles.clothHeader}>
                        <Text
                          style={[
                            styles.clothName,
                            { color: isSelected ? theme.colors.primary : theme.colors.textPrimary, fontWeight: isSelected ? '700' : '600' },
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <View style={[styles.checkCircle, { borderColor: isSelected ? theme.colors.primary : theme.colors.border, backgroundColor: isSelected ? theme.colors.primary : 'transparent' }]}>
                          {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                        </View>
                      </View>

                      <View style={styles.clothPriceRow}>
                        <Text style={[styles.clothPrice, { color: theme.colors.primary }]}>
                          {formatPrice(item.price)}
                        </Text>
                        {item.discount > 0 && item.basePrice !== item.price && (
                          <Text style={styles.clothStrikePrice}>
                            ₹{item.basePrice}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* 3. Selection Summary and Add to Cart — ONLY WHEN BOTH SELECTED */}
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
                    <View style={[styles.discountTag, { backgroundColor: theme.colors.successBg }]}>
                      <Text style={[styles.discountTagText, { color: theme.colors.success }]}>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  navigateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  navigateTitle: { fontSize: 13, fontWeight: '700' },
  navigateSub: { fontSize: 11, marginTop: 1 },

  // Service grid when choosing initially
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceEmojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  serviceCardHint: {
    fontSize: 11,
    marginTop: 4,
  },

  // Service Dropdown trigger card (replaces Deselect button)
  serviceDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
  },
  selectedServiceName: {
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Expanded Dropdown Menu
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    elevation: 3,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  dropdownMenuTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginVertical: 2,
  },
  optionEmojiCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOptionName: {
    fontSize: 14,
  },

  // Cloth / Item selection grid
  clothGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  clothCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  clothHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  clothName: {
    fontSize: 14,
    flex: 1,
    marginRight: 6,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clothPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clothPrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  clothStrikePrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  // Common tags
  discountTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountTagText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Summary Card
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
