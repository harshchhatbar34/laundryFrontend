import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Extract services, materials, and items from masters
  const services = useMemo(() => masters?.services || [], [masters]);
  const materials = useMemo(() => (masters?.materials || []).filter((m: any) => m.isActive), [masters]);
  const items = useMemo(() => (masters?.items || []).filter((i: any) => i.isActive), [masters]);

  // Calculate combination price: Item price + Material price
  const calculatedPrice = useMemo(() => {
    if (!selectedItem || !selectedMaterial) return 0;
    return (selectedItem.price || 0) + (selectedMaterial.price || 0);
  }, [selectedItem, selectedMaterial]);

  const handleAddToCart = () => {
    if (!selectedService) {
      dispatch(showToast({ type: 'warning', message: 'Please select a service' }));
      return;
    }
    if (!selectedMaterial) {
      dispatch(showToast({ type: 'warning', message: 'Please select a material/fabric' }));
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
        material: selectedMaterial._id,
        materialName: selectedMaterial.name,
        quantity,
        price: calculatedPrice,
        name: selectedItem.name,
      })
    );

    dispatch(
      showToast({
        type: 'success',
        message: `${quantity} x ${selectedItem.name} (${selectedMaterial.name} · ${selectedService.name}) added to cart`,
      })
    );

    // Reset item selection and quantity for next item
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
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* 1. Select Service */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>1. Select Service</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {services.map((s: any) => {
            const isSelected = selectedService?._id === s._id;
            const emoji = (SERVICE_ICONS as any)[s.name] || (SERVICE_ICONS as any).default;
            return (
              <Chip
                key={s._id}
                label={`${emoji} ${s.name}`}
                selected={isSelected}
                onPress={() => setSelectedService(s)}
                style={styles.chip}
              />
            );
          })}
        </ScrollView>

        {/* 2. Select Material */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: 20 }]}>2. Select Fabric/Material</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {materials.map((m: any) => {
            const isSelected = selectedMaterial?._id === m._id;
            return (
              <Chip
                key={m._id}
                label={m.name}
                selected={isSelected}
                onPress={() => setSelectedMaterial(m)}
                style={styles.chip}
              />
            );
          })}
        </ScrollView>

        {/* 3. Select Cloth */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: 20 }]}>3. Select Cloth</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {items.map((item: any) => {
            const isSelected = selectedItem?._id === item._id;
            return (
              <Chip
                key={item._id}
                label={`${item.name} (+₹${item.price})`}
                selected={isSelected}
                onPress={() => setSelectedItem(item)}
                style={styles.chip}
              />
            );
          })}
        </ScrollView>

        {/* 4. Selection Summary and Add to Cart */}
        {selectedService && selectedMaterial && selectedItem && (
          <Card style={[styles.summaryCard, { borderColor: theme.colors.primary }]} padding="medium">
            <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>Selection Summary</Text>
            <View style={styles.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
                  {selectedItem.name} ({selectedMaterial.name})
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  Service: {selectedService.name}
                </Text>
              </View>
              <Text style={[theme.typography.price, { color: theme.colors.primary }]}>
                {formatPrice(calculatedPrice * quantity)}
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
