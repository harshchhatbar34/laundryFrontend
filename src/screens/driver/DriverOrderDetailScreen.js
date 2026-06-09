import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axiosInstance';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import WatermarkView from '../../components/WatermarkView';
import { useTheme } from '../../theme/ThemeProvider';

const STATUS_FLOW = [
  { status: 'pickup',       label: 'Mark as Picked Up',     emoji: '🚗', next: 'received' },
  { status: 'received',     label: 'Received at Facility',  emoji: '🏭', next: 'out_delivery' },
  { status: 'out_delivery', label: 'Out for Delivery',      emoji: '🛵', next: 'delivered' },
  { status: 'delivered',    label: 'Mark as Delivered',     emoji: '✅', next: null },
];

const ORDER_STEPS = ['confirmed', 'pickup', 'received', 'out_delivery', 'delivered'];

function StatusStepper({ currentStatus, colors, typography, spacing, radius }) {
  const currentIdx = ORDER_STEPS.indexOf(currentStatus);
  return (
    <View style={{ paddingVertical: spacing.sm }}>
      {ORDER_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const isLast = idx === ORDER_STEPS.length - 1;
        return (
          <View key={step} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', width: 32 }}>
              <View style={[
                styles.stepDot,
                { backgroundColor: done ? colors.primary : colors.border, borderColor: done ? colors.primary : colors.border }
              ]}>
                {done && <View style={[styles.stepInner, { backgroundColor: '#FFFFFF' }]} />}
              </View>
              {!isLast && <View style={[styles.stepLine, { backgroundColor: done ? colors.primary : colors.border }]} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12, paddingBottom: isLast ? 0 : 24 }}>
              <Text style={[
                typography.label,
                { color: done ? colors.text : colors.textMuted, textTransform: 'capitalize' }
              ]}>
                {step.replace('_', ' ')}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function DriverOrderDetailScreen({ route }) {
  const { orderId } = route.params;
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const locationInterval = useRef(null);

  const fetchOrder = useCallback(async (hideLoader = false) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`, { hideLoader });
      setOrder(data.data.order);
    } catch {
      Alert.alert('Error', 'Could not load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      fetchOrder(false);
      const interval = setInterval(() => fetchOrder(true), 5000); // Poll every 5s
      return () => clearInterval(interval);
    }, [fetchOrder])
  );

  // Share driver location while order is active
  useEffect(() => {
    if (!order) return;
    const activeStatuses = ['pickup', 'out_delivery'];
    if (!activeStatuses.includes(order.status)) {
      if (locationInterval.current) clearInterval(locationInterval.current);
      return;
    }

    const shareLocation = async () => {
      try {
        // Use a simple mock for now - in production integrate expo-location
        // const loc = await Location.getCurrentPositionAsync({});
        await api.put('/orders/driver/location', { lat: 25.2048, lng: 55.2708 }, { hideLoader: true });
      } catch {
        // Silent fail - non-critical
      }
    };

    shareLocation();
    locationInterval.current = setInterval(shareLocation, 15000);
    return () => clearInterval(locationInterval.current);
  }, [order?.status]);

  const getNextAction = () => {
    if (!order) return null;
    return STATUS_FLOW.find((s) => s.status === order.status);
  };

  const handleUpdateStatus = async (targetStatus, label) => {
    Alert.alert('Update Status', `Mark order as "${label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setUpdating(true);
          try {
            await api.put(`/orders/driver/${orderId}/status`, {
              status: targetStatus,
              note: `Driver updated status to ${label}`,
            });
            await fetchOrder();
            if (targetStatus === 'delivered') {
              Alert.alert('Delivered! 🎉', 'Order has been successfully delivered.');
            }
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to update status');
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const openMaps = () => {
    if (!order?.address?.coordinates?.lat) {
      Alert.alert('No GPS', 'No GPS coordinates for this address. Use the address details.');
      return;
    }
    const { lat, lng } = order.address.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const callCustomer = () => {
    const phone = order?.user?.mobileNumber;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  if (loading || !order) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const nextAction = getNextAction();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WatermarkView />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>

        {/* Order header */}
        <ThemedCard style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[typography.h2, { color: colors.text }]}>{order.orderNumber}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                Pickup: {order.scheduledPickup?.slot} · {new Date(order.scheduledPickup?.date).toLocaleDateString('en-AE')}
              </Text>
            </View>
            <Text style={{ fontSize: 36 }}>🧺</Text>
          </View>
        </ThemedCard>

        {/* Status stepper */}
        <ThemedCard title="Order Progress" style={{ marginBottom: spacing.md }}>
          <StatusStepper
            currentStatus={order.status}
            colors={colors}
            typography={typography}
            spacing={spacing}
            radius={radius}
          />
        </ThemedCard>

        {/* Customer card */}
        <ThemedCard title="Customer" style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>
                {order.user?.name || 'Customer'}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{order.user?.mobileNumber}</Text>
            </View>
            <TouchableOpacity
              onPress={callCustomer}
              style={[styles.actionBtn, { backgroundColor: colors.success + '15' }]}
            >
              <Text style={[typography.caption, { color: colors.success, fontWeight: '700' }]}>📞 Call</Text>
            </TouchableOpacity>
          </View>
        </ThemedCard>

        {/* Address */}
        <ThemedCard title="Pickup / Delivery Address" style={{ marginBottom: spacing.md }}>
          <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
            {order.address?.flatHouseNo}, {order.address?.society}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
            {order.address?.landmark ? `${order.address.landmark}, ` : ''}{order.address?.city}, {order.address?.state} - {order.address?.pincode}
          </Text>
          <TouchableOpacity
            onPress={openMaps}
            style={[styles.mapsBtn, { backgroundColor: colors.primary, borderRadius: radius.md, marginTop: spacing.md }]}
          >
            <Text style={[typography.label, { color: '#FFFFFF' }]}>🗺 Navigate in Google Maps</Text>
          </TouchableOpacity>
        </ThemedCard>

        {/* Items */}
        <ThemedCard title="Order Items" style={{ marginBottom: spacing.md }}>
          {order.items?.map((item, idx) => (
            <View key={idx} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { color: colors.text }]}>{item.item?.name}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {item.material?.name} · {item.service?.name}
                </Text>
              </View>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>×{item.quantity}</Text>
            </View>
          ))}
        </ThemedCard>

        {/* Notes */}
        {order.notes ? (
          <ThemedCard style={{ marginBottom: spacing.md, backgroundColor: colors.warning + '10', borderColor: colors.warning + '40', borderWidth: 1 }}>
            <Text style={[typography.label, { color: colors.warning }]}>📝 Customer Note</Text>
            <Text style={[typography.bodySmall, { color: colors.text, marginTop: 4 }]}>{order.notes}</Text>
          </ThemedCard>
        ) : null}

        {/* Bill */}
        <ThemedCard title="Payment" style={{ marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[typography.h3, { color: colors.primary }]}>AED {order.pricing?.total?.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>Payment</Text>
            <View style={[styles.payBadge, { backgroundColor: colors.info + '20' }]}>
              <Text style={[typography.caption, { color: colors.info, fontWeight: '700' }]}>
                {order.paymentMethod?.toUpperCase()}
              </Text>
            </View>
          </View>
        </ThemedCard>
      </ScrollView>

      {/* Sticky action button */}
      {nextAction && order.status !== 'delivered' && order.status !== 'cancelled' && (
        <View style={[styles.stickyBtn, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <ThemedButton
            label={`${nextAction.emoji}  ${nextAction.label}`}
            onPress={() => handleUpdateStatus(nextAction.next || nextAction.status, nextAction.label)}
            loading={updating}
            variant={nextAction.next === null ? 'accent' : 'primary'}
          />
        </View>
      )}

      {order.status === 'delivered' && (
        <View style={[styles.stickyBtn, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={[styles.deliveredBanner, { backgroundColor: colors.success + '15', borderRadius: radius.md }]}>
            <Text style={[typography.body, { color: colors.success, fontWeight: '700', textAlign: 'center' }]}>
              ✅ Order Delivered Successfully
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stepDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepInner: { width: 8, height: 8, borderRadius: 4 },
  stepLine: { width: 2, flex: 1, minHeight: 20 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  mapsBtn: { paddingVertical: 12, alignItems: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5 },
  payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  stickyBtn: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
  deliveredBanner: { paddingVertical: 14, paddingHorizontal: 16 },
});
