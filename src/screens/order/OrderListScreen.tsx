import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getOrders } from '../../api/orders';
import { formatPrice, formatDate } from '../../utils/helpers';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/CustomerTabs';

type Props = NativeStackScreenProps<OrderStackParamList, 'OrderList'>;

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function OrderListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await getOrders(params);
      if (res?.data) setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []);
    } catch (e) { console.log(e); }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  const onRefresh = async () => { setRefreshing(true); await fetchOrders(); setRefreshing(false); };

  const renderOrder = ({ item, index }: { item: any; index: number }) => (
    <FadeSlideIn delay={index * 70}>
      <Card onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })} style={{ marginBottom: 12 }} padding="medium">
        <View style={styles.orderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{item.orderNumber || `Order #${item._id?.slice(-6)}`}</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>{formatDate(item.createdAt)}</Text>
          </View>
          <Badge status={item.status} />
        </View>
        <View style={[styles.orderFooter, { borderTopColor: theme.colors.divider }]}>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
            {item.items?.length || 0} items
          </Text>
          <Text style={[theme.typography.priceSmall, { color: theme.colors.primary }]}>
            {formatPrice(item.pricing?.total || 0)}
          </Text>
        </View>
      </Card>
    </FadeSlideIn>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title="My Orders" />
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Chip key={f.value} label={f.label} selected={filter === f.value}
            onPress={() => setFilter(f.value)} style={{ marginRight: 8 }} />
        ))}
      </View>
      <FlatList data={orders} renderItem={renderOrder} keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No orders yet" description="Place your first order to see it here" />}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 },
  orderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
});
