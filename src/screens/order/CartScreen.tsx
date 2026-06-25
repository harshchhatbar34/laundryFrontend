import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import * as Location from 'expo-location';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import Divider from '../../components/ui/Divider';
import { useTheme } from '../../theme/ThemeContext';
import { removeFromCart, updateCartQuantity, clearCart } from '../../store/slices/orderSlice';
import { createOrder } from '../../api/orders';
import { getNearestBranch } from '../../api/branches';
import { getAddresses } from '../../api/user';
import { formatPrice, calculateCartTotal } from '../../utils/helpers';
import { PICKUP_SLOTS } from '../../utils/constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/CustomerTabs';
import { AppDispatch, RootState } from '../../store';

type Props = NativeStackScreenProps<HomeStackParamList, 'Cart'>;

export default function CartScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((s: RootState) => s.orders.cart);
  
  const [selectedSlot, setSelectedSlot] = useState<string>(PICKUP_SLOTS[0].value);
  const [coupon, setCoupon] = useState('');
  const [addressId, setAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [resolvedBranch, setResolvedBranch] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = calculateCartTotal(cart);
  const total = subtotal;

  // Resolve nearest branch on mount
  useEffect(() => {
    const resolveNearestBranch = async () => {
      try {
        let lat = 23.0225;
        let lng = 72.5714;
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getLastKnownPositionAsync({});
          if (!loc) {
            loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          }
          if (loc) {
            lat = loc.coords.latitude;
            lng = loc.coords.longitude;
          }
        }
        const res = await getNearestBranch(lat, lng).catch(() => null);
        if (res?.data?.branch) {
          setResolvedBranch(res.data.branch);
        }
      } catch (err) {
        console.log('Error resolving branch:', err);
      }
    };
    resolveNearestBranch();
  }, []);

  // Fetch addresses on mount and auto-select default or first address
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await getAddresses();
        const list = Array.isArray(res.data) ? res.data : res.data?.addresses || [];
        if (list.length > 0) {
          const def = list.find((a: any) => a.isDefault) || list[0];
          setSelectedAddress(def);
          setAddressId(def._id);
        }
      } catch (err) {
        console.log('Error loading addresses in cart:', err);
      }
    };
    loadAddresses();
  }, []);

  // Update selected address when passed back from AddressListScreen
  useEffect(() => {
    const params = route.params as any;
    if (params?.selectedAddress) {
      setSelectedAddress(params.selectedAddress);
      setAddressId(params.selectedAddress._id);
    }
  }, [route.params]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      dispatch(showToast({ type: 'warning', message: 'Add items before placing order' }));
      return;
    }
    if (!resolvedBranch) {
      dispatch(showToast({ type: 'error', message: 'No laundry branch found near your location. Cannot place order.' }));
      return;
    }
    if (!addressId) {
      dispatch(showToast({ type: 'warning', message: 'Please select a delivery address' }));
      return;
    }
    setLoading(true);
    try {
      const items = cart.map((c) => ({ material: c.material, item: c.item, service: c.service, quantity: c.quantity }));
      const data = {
        branchId: resolvedBranch._id,
        addressId: addressId,
        scheduledPickup: { date: new Date().toISOString().split('T')[0], slot: selectedSlot },
        items,
        paymentMethod: 'cash', // Default to cash, payment will be handled at the time of delivery
        ...(coupon ? { couponCode: coupon } : {}),
      };
      await createOrder(data);
      dispatch(clearCart());
      (navigation as any).navigate('Orders', { screen: 'OrderList' });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item, index }: { item: any; index: number }) => (
    <Card style={{ marginBottom: 10 }} padding="medium" variant="outlined">
      <View style={styles.cartRow}>
        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{item.itemName || 'Item'}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            {item.materialName} · {item.serviceName}
          </Text>
        </View>
        <View style={styles.stepper}>
          <TouchableOpacity onPress={() => item.quantity <= 1 ? dispatch(removeFromCart(index)) : dispatch(updateCartQuantity({ index, quantity: item.quantity - 1 }))}
            style={[styles.stepBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="remove" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[theme.typography.label, styles.qtyText, { color: theme.colors.textPrimary }]}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => dispatch(updateCartQuantity({ index, quantity: item.quantity + 1 }))}
            style={[styles.stepBtn, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="add" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={[theme.typography.priceSmall, { color: theme.colors.primary, marginLeft: 12, minWidth: 60, textAlign: 'right' }]}>
          {formatPrice(item.price * item.quantity)}
        </Text>
        <TouchableOpacity 
          onPress={() => dispatch(removeFromCart(index))} 
          style={styles.deleteBtn}
          hitSlop={theme.hitSlop}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title="My Cart" showBack onBack={() => navigation.goBack()} subtitle={`${cart.length} items`} />
      <FlatList data={cart} renderItem={renderCartItem} keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }} showsVerticalScrollIndicator={false}
        ListFooterComponent={() => cart.length > 0 ? (
          <View>
            <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginTop: 12, marginBottom: 8 }]}>Pickup Slot</Text>
            <View style={styles.chipWrap}>
              {PICKUP_SLOTS.map((s) => (
                <Chip
                  key={s.value}
                  label={s.label}
                  selected={selectedSlot === s.value}
                  onPress={() => setSelectedSlot(s.value)}
                  style={[styles.slotChip, { justifyContent: 'center' }]}
                />
              ))}
            </View>
            
            <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginTop: 16, marginBottom: 8 }]}>Processing Branch</Text>
            <Card padding="medium" variant="outlined" style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="storefront-outline" size={20} color={theme.colors.primary} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
                  {resolvedBranch ? resolvedBranch.name : 'Resolving nearest branch...'}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  {resolvedBranch ? `${resolvedBranch.addressLine}, ${resolvedBranch.city}` : 'Finding nearest shop...'}
                </Text>
              </View>
              {resolvedBranch?.isLive && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success }} />
              )}
            </Card>

            <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginTop: 8, marginBottom: 8 }]}>Delivery Address</Text>
            {selectedAddress ? (
              <Card padding="medium" variant="outlined" style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location" size={22} color={theme.colors.primary} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
                      {selectedAddress.label}
                    </Text>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                      {selectedAddress.addressLine1}{selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}
                      {`\n`}{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => (navigation as any).navigate('Profile', { screen: 'AddressList', params: { isSelecting: true } })}
                    style={[styles.changeBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                  >
                    <Text style={[theme.typography.labelSmall, { color: theme.colors.primary }]}>Change</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : (
              <TouchableOpacity 
                onPress={() => (navigation as any).navigate('Profile', { screen: 'AddressList', params: { isSelecting: true } })} 
                style={[styles.addressBtn, { borderColor: theme.colors.border, marginBottom: 16 }]}
              >
                <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
                <Text style={[theme.typography.body, { color: theme.colors.primary, marginLeft: 8 }]}>Select Delivery Address</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            )}

            <Divider />
            <View style={styles.priceRow}>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>Subtotal</Text>
              <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Total</Text>
              <Text style={[theme.typography.price, { color: theme.colors.primary }]}>{formatPrice(total)}</Text>
            </View>
          </View>
        ) : null}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={{ fontSize: 64 }}>🧺</Text>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 16 }]}>Cart is empty</Text>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 8 }]}>Browse services to add items</Text>
          </View>
        )}
      />
      {cart.length > 0 && (
        <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }, theme.shadows.lg as any]}>
          <Button title="Place Order" onPress={handlePlaceOrder} loading={loading} icon="checkmark-circle-outline" />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  cartRow: { flexDirection: 'row', alignItems: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  qtyText: { minWidth: 24, textAlign: 'center' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  slotChip: { width: '48.5%', marginBottom: 8, paddingHorizontal: 4 },
  addressBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  changeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  empty: { alignItems: 'center', paddingTop: 80 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
  deleteBtn: { marginLeft: 12, padding: 4 },
});
