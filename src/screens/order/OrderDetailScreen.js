import React, { useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchOrderById, cancelOrder } from '../../store/orderSlice';
import { useTheme } from '../../theme/ThemeProvider';
import ThemedCard from '../../components/ThemedCard';
import ThemedButton from '../../components/ThemedButton';
import OrderStatusTracker from '../../components/OrderStatusTracker';
import WatermarkView from '../../components/WatermarkView';

export default function OrderDetailScreen({ route }) {
  const { orderId } = route.params;
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchOrderById(orderId));
      const interval = setInterval(() => {
        dispatch(fetchOrderById({ id: orderId, hideLoader: true }));
      }, 5000);
      return () => clearInterval(interval);
    }, [dispatch, orderId])
  );

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => dispatch(cancelOrder(orderId)),
      },
    ]);
  };

  if ((loading && !order) || (order && order._id !== orderId)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WatermarkView />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
      {/* Order number + date */}
      <ThemedCard style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={[typography.h3, { color: colors.text }]}>{order.orderNumber}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <View style={{ backgroundColor: colors.primary + '20', borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={[typography.label, { color: colors.primary }]}>COD</Text>
          </View>
        </View>
      </ThemedCard>

      {/* Status Tracker */}
      <ThemedCard title="Order Status" style={{ marginBottom: spacing.md }}>
        <OrderStatusTracker currentStatus={order.status} />
      </ThemedCard>

      {/* Items */}
      <ThemedCard title="Items" style={{ marginBottom: spacing.md }}>
        {order.items?.map((item, idx) => (
          <View key={idx} style={{ marginBottom: idx === order.items.length - 1 ? 0 : 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>{item.item?.name}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {item.material?.name} • {item.service?.name}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.body, { color: colors.text }]}>₹{item.price * item.quantity}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  ₹{item.price} x {item.quantity}
                </Text>
              </View>
            </View>
            {idx < order.items.length - 1 && (
              <View style={{ height: 1, backgroundColor: colors.border + '50', marginTop: 12 }} />
            )}
          </View>
        ))}
      </ThemedCard>

      <ThemedCard title="Delivery Address" style={{ marginBottom: spacing.md }}>
          <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
            {order.address?.flatHouseNo}, {order.address?.society}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
            {order.address?.landmark ? `${order.address.landmark}, ` : ''}{order.address?.city}, {order.address?.state} - {order.address?.pincode}
          </Text>
      </ThemedCard>

      {/* Pricing */}
      <ThemedCard title="Bill Summary" style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Subtotal</Text>
          <Text style={[typography.body, { color: colors.text }]}>₹{order.pricing?.subtotal?.toFixed(2)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>GST (5%)</Text>
          <Text style={[typography.body, { color: colors.text }]}>₹{(order.pricing?.subtotal * 0.05).toFixed(2)}</Text>
        </View>
        {order.pricing?.discount > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={[typography.body, { color: colors.success }]}>Discount</Text>
            <Text style={[typography.body, { color: colors.success }]}>-₹{order.pricing?.discount?.toFixed(2)}</Text>
          </View>
        )}
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
          <Text style={[typography.h3, { color: colors.text }]}>Total Amount</Text>
          <Text style={[typography.h3, { color: colors.primary }]}>₹{order.pricing?.total?.toFixed(2)}</Text>
        </View>
      </ThemedCard>

      {/* Cancel button */}
      {['pending', 'confirmed'].includes(order.status) && (
        <ThemedButton
          label="Cancel Order"
          variant="danger"
          onPress={handleCancel}
          style={{ marginBottom: spacing.lg }}
        />
      )}
    </ScrollView>
    </View>
  );
}
