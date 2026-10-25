import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import { useTheme } from '../../theme/ThemeContext';
import { addToCart } from '../../store/slices/orderSlice';
import { formatPrice } from '../../utils/helpers';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/CustomerTabs';
import { AppDispatch } from '../../store';

type Props = NativeStackScreenProps<HomeStackParamList, 'ServiceDetail'>;

export default function ServiceDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { service, masters } = route.params;
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Build display combinations — use service-specific items and apply discount
  const itemsWithPrices = useMemo(() => {
    const allMasterItems = masters?.items || [];
    const discount = service.discount || 0;

    if (service.items && Array.isArray(service.items) && service.items.length > 0) {
      return service.items
        .filter((si: any) => si.isActive !== false)
        .map((si: any) => {
          const itemObj = si.item?._id
            ? si.item
            : allMasterItems.find((it: any) => it._id === (si.item?._id || si.item));
          const basePrice = si.price != null ? si.price : (itemObj?.price || 0);
          const finalPrice = discount > 0 ? Math.max(0, Math.round(basePrice * (1 - discount / 100))) : basePrice;

          return {
            item: itemObj?._id || si.item,
            itemName: itemObj?.name || 'Item',
            price: finalPrice,
            basePrice,
            discount,
          };
        });
    }

    // Fallback if service has no specific items configured
    return allMasterItems
      .filter((item: any) => item.isActive)
      .map((item: any) => {
        const basePrice = item.price || 0;
        const finalPrice = discount > 0 ? Math.max(0, Math.round(basePrice * (1 - discount / 100))) : basePrice;
        return {
          item: item._id,
          itemName: item.name,
          price: finalPrice,
          basePrice,
          discount,
        };
      });
  }, [masters, service]);

  const updateQty = (key: string, delta: number) => {
    setQuantities((prev) => {
      const val = (prev[key] || 0) + delta;
      if (val <= 0) {
        const n = { ...prev };
        delete n[key];
        return n;
      }
      return { ...prev, [key]: val };
    });
  };

  const totalItems = Object.values(quantities).reduce((s, v) => s + v, 0);
  const totalPrice = Object.entries(quantities).reduce((s, [key, qty]) => {
    const p = itemsWithPrices.find((i: any) => i.item === key);
    return s + (p ? p.price * qty : 0);
  }, 0);

  const handleAddToCart = () => {
    Object.entries(quantities).forEach(([key, qty]) => {
      const p = itemsWithPrices.find((i: any) => i.item === key);
      if (p) {
        dispatch(addToCart({
          service: service._id,
          serviceName: service.name,
          item: p.item,
          itemName: p.itemName,
          quantity: qty,
          price: p.price,
          name: p.itemName,
        }));
      }
    });
    navigation.goBack();
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const key = item.item;
    const qty = quantities[key] || 0;

    return (
      <FadeSlideIn delay={index * 40}>
        <Card style={{ marginBottom: 10 }} padding="medium" variant="outlined">
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{item.itemName}</Text>
              {item.discount > 0 && (
                <Text style={[theme.typography.captionSmall, { color: theme.colors.success, fontWeight: '700', marginTop: 2 }]}>
                  {item.discount}% OFF
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end', marginRight: 16 }}>
              <Text style={[theme.typography.priceSmall, { color: theme.colors.primary }]}>
                {formatPrice(item.price)}
              </Text>
              {item.discount > 0 && item.basePrice !== item.price && (
                <Text style={[theme.typography.captionSmall, { textDecorationLine: 'line-through', color: theme.colors.textMuted }]}>
                  {formatPrice(item.basePrice)}
                </Text>
              )}
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => updateQty(key, -1)} style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Ionicons name="remove" size={18} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[theme.typography.label, { color: theme.colors.textPrimary, minWidth: 28, textAlign: 'center' }]}>{qty}</Text>
              <TouchableOpacity onPress={() => updateQty(key, 1)} style={[styles.stepBtn, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="add" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </FadeSlideIn>
    );
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header title={service.name} showBack onBack={() => navigation.goBack()} />

      <FlatList
        data={itemsWithPrices}
        renderItem={renderItem}
        keyExtractor={(i) => i.item}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {totalItems > 0 && (
        <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }, theme.shadows.lg as any]}>
          <View>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>{totalItems} items selected</Text>
            <Text style={[theme.typography.price, { color: theme.colors.textPrimary }]}>{formatPrice(totalPrice)}</Text>
          </View>
          <Button
            title="Add to Cart"
            onPress={handleAddToCart}
            icon="cart-outline"
            size="medium"
            fullWidth={false}
            style={{ paddingHorizontal: 28 }}
          />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
});

