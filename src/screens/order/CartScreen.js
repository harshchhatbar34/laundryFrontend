import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/axiosInstance';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import { clearCart, placeOrder, removeFromCart } from '../../store/orderSlice';
import { useTheme } from '../../theme/ThemeProvider';
import WatermarkView from '../../components/WatermarkView';

const TIME_SLOTS = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'];

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const { cart, loading } = useSelector((s) => s.orders);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [pickupDate, setPickupDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/users/addresses', { hideLoader: true });
      const fetchedAddrs = data.data.addresses || [];
      setAddresses(fetchedAddrs);
      setSelectedAddress(fetchedAddrs.find((a) => a.isDefault) || (fetchedAddrs.length > 0 ? fetchedAddrs[0] : null));
    } catch (error) {
      console.log('Error fetching addresses');
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + gst;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return Alert.alert('Error', 'Your cart is empty');
    if (!selectedAddress) return Alert.alert('Error', 'Please select a delivery address');

    const orderData = {
      items: cart,
      addressId: selectedAddress._id,
      scheduledPickup: {
        date: pickupDate.toISOString(),
        slot: selectedSlot
      },
    };

    const result = await dispatch(placeOrder(orderData));

    if (placeOrder.fulfilled.match(result)) {
      dispatch(clearCart());
      Alert.alert('✅ Order Placed!', `Order ${result.payload.orderNumber} placed successfully.`, [
        { text: 'View Orders', onPress: () => navigation.navigate('OrdersTab') },
      ]);
    } else {
      Alert.alert('Error', result.payload || 'Failed to place order');
    }
  };

  const renderItem = ({ item, index }) => (
    <ThemedCard style={{ marginBottom: spacing.sm }}>
      <View style={styles.cartItem}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: colors.text }]}>{item.itemName}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {item.materialName} • {item.serviceName}
          </Text>
          <Text style={[typography.body, { color: colors.primary, marginTop: 4 }]}>
            ₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}
          </Text>
        </View>
        <TouchableOpacity onPress={() => dispatch(removeFromCart({ index }))}>
          <Text style={{ fontSize: 20 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </ThemedCard>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WatermarkView />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={[typography.h1, { color: colors.text, marginBottom: spacing.lg }]}>Your Cart</Text>

        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={{ fontSize: 64 }}>🛒</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>Your cart is empty</Text>
            <ThemedButton
              label="Add Items"
              variant="outline"
              style={{ marginTop: spacing.lg }}
              onPress={() => navigation.navigate('HomeTab', { screen: 'CreateOrder' })}
            />
          </View>
        ) : (
          <>
            <FlatList
              data={cart}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.item}-${index}`}
              scrollEnabled={false}
            />

            <ThemedCard title="Delivery Address" style={{ marginVertical: spacing.lg }}>
              {addresses.length === 0 ? (
                <ThemedButton
                  label="+ Add Address"
                  variant="outline"
                  onPress={() => navigation.navigate('ProfileTab', { screen: 'AddressList' })}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('ProfileTab', { screen: 'AddressList' })}
                  style={[styles.addressBox, { borderColor: colors.border, backgroundColor: colors.inputBg, borderRadius: radius.md }]}
                >
                  <Text style={[typography.label, { color: colors.text }]}>{selectedAddress?.label}</Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={2}>
                    {selectedAddress?.flatHouseNo}, {selectedAddress?.society}, {selectedAddress?.city}
                  </Text>
                </TouchableOpacity>
              )}
            </ThemedCard>

            <ThemedCard title="Pickup Schedule" style={{ marginBottom: spacing.lg }}>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 8 }]}>Pickup Date</Text>
                  <View style={[styles.addressBox, { borderColor: colors.border, backgroundColor: colors.inputBg, borderRadius: radius.md, padding: 12, marginBottom: 12 }]}>
                    <Text style={[typography.body, { color: colors.text }]}>
                      {pickupDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={pickupDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setPickupDate(date);
                  }}
                />
              )}

              <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 8 }]}>Time Slot</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TIME_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => setSelectedSlot(slot)}
                    style={{
                      paddingHorizontal: 10, paddingVertical: 6,
                      borderRadius: radius.sm,
                      backgroundColor: selectedSlot === slot ? colors.primary : colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: selectedSlot === slot ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={[typography.caption, { color: selectedSlot === slot ? '#FFFFFF' : colors.text }]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedCard>

            <ThemedCard title="Bill Summary" style={{ marginBottom: spacing.xl }}>
              <View style={styles.billRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[typography.body, { color: colors.text }]}>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>GST (5%)</Text>
                <Text style={[typography.body, { color: colors.text }]}>₹{gst.toFixed(2)}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.billRow}>
                <Text style={[typography.h3, { color: colors.text }]}>Total Amount</Text>
                <Text style={[typography.h3, { color: colors.primary }]}>₹{total.toFixed(2)}</Text>
              </View>
            </ThemedCard>

            <ThemedButton 
              label="+ Add More Items" 
              variant="outline" 
              onPress={() => navigation.navigate('HomeTab', { screen: 'CreateOrder' })} 
              style={{ marginBottom: spacing.md }} 
            />
            <ThemedButton label="Place Order" onPress={handlePlaceOrder} loading={loading} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyCart: {
    alignItems: 'center',
    marginTop: 100,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  addressBox: {
    padding: 12,
    borderWidth: 1,
  },
});
