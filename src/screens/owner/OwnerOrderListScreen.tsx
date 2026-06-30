import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { respondToOrder, getOwnerOrders } from '../../api/owner';
import { formatPrice, formatDate } from '../../utils/helpers';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerOrderStackParamList } from '../../navigation/OwnerTabs';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<OwnerOrderStackParamList, 'OwnerOrderList'>;

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Pickup', value: 'pickup' },
  { label: 'Picked Up', value: 'picked_up' },
  { label: 'Processing', value: 'processing' },
  { label: 'Ready', value: 'ready' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Failed Delivery', value: 'failed_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function OwnerOrderListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Rejection modal state
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetch = useCallback(async (isSilent = false) => {
    try {
      const r = await getOwnerOrders({ status: filter }, isSilent ? { hideLoader: true } : undefined);
      if (r?.data) {
        setOrders(Array.isArray(r.data) ? r.data : r.data.orders || []);
      }
    } catch (e) {
      console.log(e);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      fetch(false);

      // Poll every 15 seconds silently while focused
      const interval = setInterval(() => fetch(true), 15000);
      return () => clearInterval(interval);
    }, [fetch])
  );

  const onRefresh = async () => { setRefreshing(true); await fetch(false); setRefreshing(false); };

  const handleRespond = async (id: string, action: string) => {
    if (action === 'reject') {
      // Open cross-platform reject reason modal
      setRejectOrderId(id);
      setRejectReason('');
      setRejectModalVisible(true);
    } else {
      await respondToOrder(id, 'accept');
      fetch(true);
    }
  };

  const handleConfirmReject = async () => {
    setRejectLoading(true);
    try {
      await respondToOrder(rejectOrderId, 'reject', rejectReason.trim() || undefined);
      setRejectModalVisible(false);
      fetch(true);
    } catch (e) {
      console.log(e);
    } finally {
      setRejectLoading(false);
    }
  };

  const renderOrder = ({ item, index }: { item: any; index: number }) => (
    <FadeSlideIn delay={index * 60}>
      <Card onPress={() => navigation.navigate('OwnerOrderDetail', { orderId: item._id })} style={{ marginBottom: 12 }} padding="medium">
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{item.orderNumber || `#${item._id?.slice(-6)}`}</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
              {item.customer?.name || 'Customer'} · {formatDate(item.createdAt)}
            </Text>
          </View>
          <Badge status={item.status} size="small" />
        </View>
        <View style={[styles.footer, { borderTopColor: theme.colors.divider }]}>
          <Text style={[theme.typography.priceSmall, { color: theme.colors.primary }]}>{formatPrice(item.pricing?.total || 0)}</Text>
          {item.status === 'pending' && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Accept" onPress={() => handleRespond(item._id, 'accept')} size="small" fullWidth={false} />
              <Button title="Reject" onPress={() => handleRespond(item._id, 'reject')} size="small" variant="danger" fullWidth={false} />
            </View>
          )}
        </View>
      </Card>
    </FadeSlideIn>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Orders" showBack onBack={() => navigation.goBack()} />
      <View style={styles.filterRow}>
        {FILTERS.map((f) => <Chip key={f.value} label={f.label} selected={filter === f.value} onPress={() => setFilter(f.value)} style={{ marginRight: 8 }} />)}
      </View>
      <FlatList data={orders} renderItem={renderOrder} keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No orders" />}
      />

      {/* ── Rejection Reason Modal ─────────────────────────────────── */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.rejectModalContent, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={styles.rejectModalHeader}>
              <View style={[styles.rejectIconBg, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Reject Order</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                  The customer will be notified with your reason.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Reason input */}
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary, marginBottom: 8, marginTop: 4 }]}>
              Reason for rejection <Text style={{ color: theme.colors.textMuted, fontWeight: '400' }}>(optional)</Text>
            </Text>
            <TextInput
              style={[styles.rejectInput, {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.borderLight,
                color: theme.colors.textPrimary,
              }]}
              placeholder="e.g. Out of service area, fully booked, item not accepted..."
              placeholderTextColor={theme.colors.textMuted}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              maxLength={300}
              textAlignVertical="top"
            />
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted, textAlign: 'right', marginBottom: 16 }]}>
              {rejectReason.length}/300
            </Text>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                title="Cancel"
                onPress={() => setRejectModalVisible(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Confirm Reject"
                onPress={handleConfirmReject}
                variant="danger"
                loading={rejectLoading}
                icon="close-circle-outline"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  rejectModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  rejectModalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rejectIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  rejectInput: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 90, fontSize: 14, marginBottom: 6 },
});
