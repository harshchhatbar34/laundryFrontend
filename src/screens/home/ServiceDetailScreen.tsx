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
  
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Get active materials from masters
  const materials = useMemo(() => {
    if (!masters?.materials) return [];
    return masters.materials.filter((m: any) => m.isActive);
  }, [masters]);

  // Set default material on mount
  useEffect(() => {
    if (materials.length > 0) {
      setSelectedMaterialId(materials[0]._id);
    }
  }, [materials]);

  // Build display combinations — prices are display-only estimates from master data.
  // Real price is recalculated by backend using IDs on order creation.
  const itemsWithPrices = useMemo(() => {
    if (!masters) return [];
    const { items = [] } = masters;
    const result: any[] = [];
    items.forEach((item: any) => {
      if (!item.isActive) return;
      materials.forEach((material: any) => {
        // Estimate: item + material + service price for display only
        const estimatedPrice = (item.price || 0) + (material.price || 0) + (service.price || 0);
        result.push({
          item: item._id,
          itemName: item.name,
          material: material._id,
          materialName: material.name,
          price: estimatedPrice, // display estimate only
        });
      });
    });
    return result;
  }, [masters, materials, service]);

  // Filter items to show only the ones for the selected material
  const visibleItems = useMemo(() => {
    if (!selectedMaterialId) return [];
    return itemsWithPrices.filter((item) => item.material === selectedMaterialId);
  }, [itemsWithPrices, selectedMaterialId]);

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
    const p = itemsWithPrices.find((i) => `${i.item}-${i.material}` === key);
    return s + (p ? p.price * qty : 0);
  }, 0);

  const handleAddToCart = () => {
    Object.entries(quantities).forEach(([key, qty]) => {
      const p = itemsWithPrices.find((i) => `${i.item}-${i.material}` === key);
      if (p) {
        dispatch(addToCart({
          service: service._id,
          serviceName: service.name,
          item: p.item,
          itemName: p.itemName,
          material: p.material,
          materialName: p.materialName,
          quantity: qty,
          price: p.price, // display-only estimate; backend recalculates real price from DB
          name: p.itemName,
        }));
      }
    });
    navigation.goBack();
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const key = `${item.item}-${item.material}`;
    const qty = quantities[key] || 0;
    return (
      <FadeSlideIn delay={index * 40}>
        <Card style={{ marginBottom: 10 }} padding="medium" variant="outlined">
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{item.itemName}</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{item.materialName}</Text>
            </View>
            <Text style={[theme.typography.priceSmall, { color: theme.colors.primary, marginRight: 16 }]}>
              {formatPrice(item.price)}
            </Text>
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
      
      {/* Horizontal Scrollable Fabric/Material Tabs */}
      {materials.length > 0 && (
        <View style={[styles.tabBarContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <Text style={[theme.typography.labelSmall, { color: theme.colors.textSecondary, marginTop: 12, marginHorizontal: 16, marginBottom: 8 }]}>
            Select Fabric / Material
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {materials.map((m: any) => (
              <Chip
                key={m._id}
                label={m.name}
                selected={selectedMaterialId === m._id}
                onPress={() => setSelectedMaterialId(m._id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={visibleItems}
        renderItem={renderItem}
        keyExtractor={(i) => `${i.item}-${i.material}`}
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

