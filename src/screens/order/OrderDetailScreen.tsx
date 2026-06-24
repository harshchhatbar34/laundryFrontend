import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Divider from '../../components/ui/Divider';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { getOrderDetail, cancelOrder, rescheduleDelivery, confirmOrderBill } from '../../api/orders';
import { formatPrice, formatDate, getStatusLabel, getStatusColorKey } from '../../utils/helpers';
import { ORDER_STATUS_FLOW } from '../../utils/constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/CustomerTabs';

type Props = NativeStackScreenProps<OrderStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await getOrderDetail(orderId);
      if (res?.data?.order) setOrder(res.data.order);
      else if (res?.data) setOrder(res.data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure?', [
      { text: 'No' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        await cancelOrder(orderId);
        navigation.goBack();
      }},
    ]);
  };

  const handleReschedule = () => {
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt('Reschedule', 'Enter new delivery date (YYYY-MM-DD)', async (date) => {
        if (date) await rescheduleDelivery(orderId, new Date(date).toISOString());
      });
    } else {
      dispatch(showToast({ type: 'info', message: 'Contact support to reschedule' }));
    }
  };

  const handleConfirmBill = async () => {
    setLoading(true);
    try {
      await confirmOrderBill(orderId);
      dispatch(showToast({ type: 'success', message: 'Bill confirmed successfully' }));
      await fetchOrder();
    } catch (e) {
      dispatch(showToast({ type: 'error', message: 'Failed to confirm bill' }));
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <ScreenWrapper><Header title="Order" showBack onBack={() => navigation.goBack()} /></ScreenWrapper>;

  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);

  return (
    <ScreenWrapper edges={[]}>
      <Header title={order.orderNumber || 'Order Details'} showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={styles.statusRow}>
          <Badge status={order.status} size="medium" />
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginLeft: 12 }]}>
            {formatDate(order.createdAt)}
          </Text>
        </View>

        {/* Timeline */}
        <Card style={{ marginTop: 16 }} padding="medium">
          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 12 }]}>Order Timeline</Text>
          {ORDER_STATUS_FLOW.map((status: any, idx: number) => {
            const isActive = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const colorKey = getStatusColorKey(status);
            return (
              <View key={status} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.dot, {
                    backgroundColor: isActive && colorKey ? (theme.colors as any)[colorKey] : theme.colors.border,
                    width: isCurrent ? 14 : 10, height: isCurrent ? 14 : 10, borderRadius: 7,
                  }]} />
                  {idx < ORDER_STATUS_FLOW.length - 1 && (
                    <View style={[styles.line, { backgroundColor: isActive && colorKey ? (theme.colors as any)[colorKey] : theme.colors.border }]} />
                  )}
                </View>
                <Text style={[theme.typography.bodySmall, {
                  color: isActive ? theme.colors.textPrimary : theme.colors.textMuted,
                  fontWeight: isCurrent ? '700' : '400', marginLeft: 12, paddingBottom: 16,
                }]}>
                  {getStatusLabel(status)}
                </Text>
              </View>
            );
          })}
        </Card>

        {/* Pickup Details & Address */}
        {(order.scheduledPickup || order.address) && (
          <Card style={{ marginTop: 16 }} padding="medium">
            <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 12 }]}>🚚 Pickup Details</Text>
            
            {order.scheduledPickup && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textPrimary, marginLeft: 6 }]}>
                  Date: {formatDate(order.scheduledPickup.date)} ({order.scheduledPickup.slot})
                </Text>
              </View>
            )}

            {order.address && (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 }}>
                <Ionicons name="location-outline" size={18} color={theme.colors.primary} style={{ marginTop: 2 }} />
                <View style={{ marginLeft: 6, flex: 1 }}>
                  <Text style={[theme.typography.labelSmall, { color: theme.colors.textPrimary }]}>
                    {order.address.label || 'Delivery Address'}
                  </Text>
                  <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                    {order.address.addressLine1}{order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}
                    {`\n`}{order.address.city}, {order.address.state} - {order.address.pincode}
                  </Text>
                </View>
              </View>
            )}
          </Card>
        )}

        {/* Bill Updated Warning Card */}
        {order.billUpdated && !order.billConfirmed && (
          <Card style={{ marginTop: 16, backgroundColor: '#FEF3C7', borderColor: '#D97706', borderWidth: 1 }} padding="medium">
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="warning-outline" size={20} color="#D97706" style={{ marginTop: 1 }} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={[theme.typography.label, { color: '#92400E', fontWeight: '700' }]}>Order Updated by Shop</Text>
                <Text style={[theme.typography.bodySmall, { color: '#B45309', marginTop: 4, lineHeight: 16 }]}>
                  The laundry owner or helper has adjusted the items, fabric materials, services, or pricing of your order at pickup. Please review the updated items list and click below to confirm.
                </Text>
                <Button title="Confirm Updated Bill" onPress={handleConfirmBill} loading={loading} style={{ marginTop: 12 }} size="small" />
              </View>
            </View>
          </Card>
        )}

        {/* Items */}
        <Card style={{ marginTop: 16 }} padding="medium">
          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 12 }]}>Items</Text>
          {(order.items || []).map((item: any, i: number) => (
            <View key={i} style={[styles.itemRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.divider, paddingTop: 8 } as any]}>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
                  {item.itemName || item.item?.name || 'Item'} × {item.quantity}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  {item.materialName || item.material?.name || ''} · {item.serviceName || item.service?.name || ''}
                </Text>
              </View>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, alignSelf: 'center' }]}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
          <Divider spacing={12} />
          <View style={styles.itemRow}>
            <Text style={[theme.typography.h4, { color: theme.colors.textPrimary }]}>Total</Text>
            <Text style={[theme.typography.price, { color: theme.colors.primary }]}>{formatPrice(order.pricing?.total || 0)}</Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={{ marginTop: 20, gap: 12 }}>
          {order.status === 'pending' && <Button title="Cancel Order" onPress={handleCancel} variant="danger" icon="close-circle-outline" />}
          {order.status === 'failed_delivery' && <Button title="Reschedule Delivery" onPress={handleReschedule} icon="calendar-outline" />}
          {order.status === 'completed' && !order.isRated && <Button title="Rate & Review" onPress={() => navigation.navigate('Rating', { orderId })} icon="star-outline" />}
          {order.status === 'completed' && order.isRated && <Button title="Rated" disabled icon="checkmark-circle" variant="outline" />}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  timelineItem: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', width: 20 },
  dot: {},
  line: { width: 2, flex: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
});
