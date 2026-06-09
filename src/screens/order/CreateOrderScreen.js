import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import api from '../../api/axiosInstance';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import ThemedPicker from '../../components/ThemedPicker';
import { addToCart } from '../../store/orderSlice';
import { useTheme } from '../../theme/ThemeProvider';
import WatermarkView from '../../components/WatermarkView';

export default function CreateOrderScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;

  const passedService = route?.params?.service;

  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedService, setSelectedService] = useState(passedService?._id || '');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  useEffect(() => {
    fetchMasters();
  }, []);

  useEffect(() => {
    if (selectedMaterial && selectedItem && selectedService) {
      fetchPrice();
    }
  }, [selectedMaterial, selectedItem, selectedService]);

  const fetchMasters = async () => {
    try {
      const [mRes, iRes, sRes] = await Promise.all([
        api.get('/masters/materials'),
        api.get('/masters/items'),
        api.get('/masters/services'),
      ]);
      setMaterials(mRes.data.data.materials.map(m => ({ label: m.name, value: m._id })));
      setItems(iRes.data.data.items.map(i => ({ label: i.name, value: i._id })));
      setServices(sRes.data.data.services.map(s => ({ label: s.name, value: s._id })));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch master data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrice = async () => {
    setFetchingPrice(true);
    try {
      const { data } = await api.get('/masters/price', {
        params: {
          materialId: selectedMaterial,
          itemId: selectedItem,
          serviceId: selectedService,
        },
      });
      setPrice(data.data.price);
    } catch (error) {
      setPrice(0);
    } finally {
      setFetchingPrice(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedMaterial || !selectedItem || !selectedService || !quantity) {
      return Alert.alert('Error', 'Please select all fields');
    }

    if (price === 0) {
      return Alert.alert('Error', 'This service combination is currently unavailable');
    }

    const materialName = materials.find(m => m.value === selectedMaterial).label;
    const itemName = items.find(i => i.value === selectedItem).label;
    const serviceName = services.find(s => s.value === selectedService).label;

    dispatch(addToCart({
      material: selectedMaterial,
      materialName,
      item: selectedItem,
      itemName,
      service: selectedService,
      serviceName,
      quantity: quantity,
      price: price,
    }));

    Alert.alert('Success', 'Item added to cart', [
      { text: 'Add More', onPress: () => reset() },
      { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') }
    ]);
  };

  const reset = () => {
    setSelectedMaterial('');
    setSelectedItem('');
    setSelectedService('');
    setQuantity(1);
    setPrice(0);
  };

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WatermarkView />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={[typography.h1, { color: colors.text, marginBottom: spacing.lg }]}>Create Order</Text>

        <ThemedCard style={{ marginBottom: spacing.lg }}>
          <ThemedPicker
            label="Material"
            placeholder="Select Material (Cotton, Silk...)"
            options={materials}
            value={selectedMaterial}
            onSelect={setSelectedMaterial}
          />

          <ThemedPicker
            label="Item Type"
            placeholder="Select Item (Shirt, Pant...)"
            options={items}
            value={selectedItem}
            onSelect={setSelectedItem}
          />

          <ThemedPicker
            label="Service Type"
            placeholder="Select Service (Wash, Iron...)"
            options={services}
            value={selectedService}
            onSelect={setSelectedService}
          />

          <View style={{ marginBottom: spacing.md }}>
            <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 8 }]}>Quantity</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                onPress={decrement}
                style={[styles.stepperButton, { borderColor: colors.border, backgroundColor: colors.inputBg, borderRadius: radius.md }]}
              >
                <Text style={{ fontSize: 24, color: colors.primary }}>−</Text>
              </TouchableOpacity>

              <View style={[styles.stepperValue, { borderColor: colors.border, backgroundColor: colors.inputBg, borderRadius: radius.md }]}>
                <Text style={[typography.h3, { color: colors.text }]}>{quantity}</Text>
              </View>

              <TouchableOpacity
                onPress={increment}
                style={[styles.stepperButton, { borderColor: colors.border, backgroundColor: colors.inputBg, borderRadius: radius.md }]}
              >
                <Text style={{ fontSize: 24, color: colors.primary }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {fetchingPrice ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : (
            price > 0 && (
              <View style={[styles.priceTag, { backgroundColor: colors.primary + '15', borderRadius: radius.md }]}>
                <Text style={[typography.label, { color: colors.textSecondary }]}>Price per unit</Text>
                <Text style={[typography.h2, { color: colors.primary }]}>₹{price}</Text>
              </View>
            )
          )}
        </ThemedCard>

        <ThemedButton
          label="Add Item to Cart"
          onPress={handleAddToCart}
          loading={fetchingPrice}
        />

        <ThemedButton
          label="View Cart"
          variant="outline"
          onPress={() => navigation.navigate('Cart')}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  priceTag: {
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  stepperValue: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
