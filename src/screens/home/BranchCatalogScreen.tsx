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
      const newQty = current.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
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

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Navigate to Branch Banner — scrolls with content, visible at top */}
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
          <Card style={[styles.summaryCard, { borderColor: theme.colors.primary + '35' }]} padding="none">
            {/* Summary Card Header */}
            <View style={[styles.summaryHeader, { borderBottomColor: theme.colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.summaryIconCircle, { backgroundColor: theme.colors.primaryBg }]}>
                  <Ionicons name="basket-outline" size={18} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>
                    Selection Summary
                  </Text>
                  <Text style={[styles.summarySubtitle, { color: theme.colors.textSecondary }]}>
                    {selectedService.name}
                  </Text>
                </View>
              </View>

              <View style={[styles.itemsCountBadge, { backgroundColor: theme.colors.primaryBg }]}>
                <Text style={[styles.itemsCountText, { color: theme.colors.primary }]}>
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </Text>
              </View>
            </View>

            {/* List of Selected Items */}
            <View style={styles.summaryItemsContainer}>
              {selectedItemsList.map(({ item, quantity: itemQty }) => (
                <View
                  key={item._id}
                  style={[
                    styles.summaryItemCard,
                    {
                      backgroundColor: theme.colors.surfaceVariant + '35',
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.summaryItemTop}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={[styles.summaryItemName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.summaryItemPriceRow}>
                        <Text style={[styles.summaryUnitPrice, { color: theme.colors.textSecondary }]}>
                          {formatPrice(item.price)} each
                        </Text>
                        {item.discount > 0 && item.basePrice !== item.price && (
                          <Text style={styles.summaryItemStrike}>
                            ₹{item.basePrice}
                          </Text>
                        )}
                      </View>
                    </View>

                    <Text style={[styles.summaryItemTotal, { color: theme.colors.primary }]}>
                      {formatPrice(item.price * itemQty)}
                    </Text>
                  </View>

                  <View style={[styles.summaryItemBottom, { borderTopColor: theme.colors.border + '60' }]}>
                    <Text style={[styles.summaryQtyLabel, { color: theme.colors.textMuted }]}>
                      Quantity
                    </Text>

                    <View style={[styles.stepperContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                      <TouchableOpacity
                        onPress={() => updateItemQty(item._id, -1)}
                        style={styles.stepperBtn}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={itemQty === 1 ? 'trash-outline' : 'remove'}
                          size={15}
                          color={itemQty === 1 ? theme.colors.error : theme.colors.textPrimary}
                        />
                      </TouchableOpacity>

                      <Text style={[styles.stepperQty, { color: theme.colors.textPrimary }]}>
                        {itemQty}
                      </Text>

                      <TouchableOpacity
                        onPress={() => updateItemQty(item._id, 1)}
                        style={[styles.stepperBtn, { backgroundColor: theme.colors.primary }]}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="add" size={15} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Summary Footer with Total and Add to Cart */}
            <View style={[styles.summaryFooter, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <View style={styles.summaryTotalRow}>
                <View>
                  <Text style={[styles.summaryTotalLabel, { color: theme.colors.textSecondary }]}>
                    Total Amount
                  </Text>
                  <Text style={[styles.summaryTotalSubtitle, { color: theme.colors.textMuted }]}>
                    {selectedItemsList.length} {selectedItemsList.length === 1 ? 'item' : 'items'} ({totalItemsCount} pcs)
                  </Text>
                </View>

                <Text style={[styles.summaryTotalPrice, { color: theme.colors.primary }]}>
                  {formatPrice(totalEstimatedPrice)}
                </Text>
              </View>

              <Button
                title={selectedItemsList.length > 1 ? `Add to Cart (${totalItemsCount} items)` : 'Add to Cart'}
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
  scroll: { padding: 16, paddingBottom: 150 },
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
    marginBottom: 16,
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
    marginTop: 26,
    marginBottom: 20,
    borderWidth: 1.5,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  summarySubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  itemsCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemsCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryItemsContainer: {
    padding: 14,
    gap: 10,
  },
  summaryItemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  summaryItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryItemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  summaryUnitPrice: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryItemStrike: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  summaryItemTotal: {
    fontSize: 15,
    fontWeight: '800',
  },
  summaryItemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  summaryQtyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  summaryFooter: {
    padding: 16,
    borderTopWidth: 1,
    gap: 14,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryTotalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryTotalPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  addBtn: {
    width: '100%',
  },
});
