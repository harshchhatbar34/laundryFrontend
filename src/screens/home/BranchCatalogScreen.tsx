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
  // Map of selected items: { [itemId]: { item: any, quantity: number } }
  const [selectedItems, setSelectedItems] = useState<Record<string, { item: any; quantity: number }>>({});

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

  const toggleSelectItem = (item: any) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[item._id]) {
        delete copy[item._id];
      } else {
        copy[item._id] = { item, quantity: 1 };
      }
      return copy;
    });
  };

  const updateItemQty = (itemId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      const newQty = Math.max(1, current.quantity + delta);
      return {
        ...prev,
        [itemId]: { ...current, quantity: newQty },
      };
    });
  };

  const selectedItemsList = useMemo(() => Object.values(selectedItems), [selectedItems]);

  const totalItemsCount = useMemo(() => {
    return selectedItemsList.reduce((sum, entry) => sum + entry.quantity, 0);
  }, [selectedItemsList]);

  const totalEstimatedPrice = useMemo(() => {
    return selectedItemsList.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  }, [selectedItemsList]);

  const handleAddToCart = () => {
    if (!selectedService) {
      dispatch(showToast({ type: 'warning', message: 'Please select a service' }));
      return;
    }
    if (selectedItemsList.length === 0) {
      dispatch(showToast({ type: 'warning', message: 'Please select at least one item' }));
      return;
    }

    selectedItemsList.forEach(({ item, quantity: itemQty }) => {
      dispatch(
        addToCart({
          service: selectedService._id,
          serviceName: selectedService.name,
          item: item._id,
          itemName: item.name,
          quantity: itemQty,
          price: item.price,
          name: item.name,
        })
      );
    });

    dispatch(
      showToast({
        type: 'success',
        message: `Added ${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'} (${selectedService.name}) to cart`,
      })
    );

    // Reset selections for next item
    setSelectedService(null);
    setServiceDropdownOpen(false);
    setSelectedItems({});
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
                        setSelectedItems({});
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
                    setSelectedItems({});
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
                  const isSelected = !!selectedItems[item._id];
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
                      onPress={() => toggleSelectItem(item)}
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

        {/* 3. Selection Summary and Add to Cart — ONLY WHEN AT LEAST 1 ITEM SELECTED */}
        {selectedService && selectedItemsList.length > 0 && (
          <Card style={[styles.summaryCard, { borderColor: theme.colors.primary }]} padding="medium">
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>
                Selection Summary
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.primary, fontWeight: '700' }]}>
                {selectedItemsList.length} {selectedItemsList.length === 1 ? 'item' : 'items'} ({totalItemsCount} pcs)
              </Text>
            </View>

            {selectedItemsList.map(({ item, quantity: itemQty }) => (
              <View
                key={item._id}
                style={[
                  styles.summaryItemRow,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.primary }}>
                      {formatPrice(item.price)}
                    </Text>
                    {item.discount > 0 && item.basePrice !== item.price && (
                      <Text style={{ fontSize: 11, color: theme.colors.textMuted, textDecorationLine: 'line-through' }}>
                        ₹{item.basePrice}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Stepper */}
                <View style={styles.stepper}>
                  <TouchableOpacity
                    onPress={() => updateItemQty(item._id, -1)}
                    style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                  >
                    <Ionicons name="remove" size={16} color={theme.colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: theme.colors.textPrimary }]}>{itemQty}</Text>
                  <TouchableOpacity
                    onPress={() => updateItemQty(item._id, 1)}
                    style={[styles.stepBtn, { backgroundColor: theme.colors.primary }]}
                  >
                    <Ionicons name="add" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <Text style={[theme.typography.price, { color: theme.colors.primary, minWidth: 64, textAlign: 'right' }]}>
                  {formatPrice(item.price * itemQty)}
                </Text>
              </View>
            ))}

            {/* Total and Add to Cart Row */}
            <View style={styles.summaryFooterRow}>
              <View>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Total Price
                </Text>
                <Text style={[theme.typography.h3, { color: theme.colors.primary, marginTop: 2 }]}>
                  {formatPrice(totalEstimatedPrice)}
                </Text>
              </View>

              <Button
                title={selectedItemsList.length > 1 ? `Add to Cart (${totalItemsCount})` : 'Add to Cart'}
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
  summaryTitle: { fontSize: 14, fontWeight: '700' },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  summaryFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 4,
  },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 15, fontWeight: '700', minWidth: 28, textAlign: 'center' },
  addBtn: { minWidth: 140, marginLeft: 16 },
});
