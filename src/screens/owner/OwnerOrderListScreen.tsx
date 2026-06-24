import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, StyleSheet, Platform } from 'react-native';
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

type Props = NativeStackScreenProps<OwnerOrderStackParamList, 'OwnerOrderList'>;

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

export default function OwnerOrderListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

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
      if (Platform.OS === 'ios' && Alert.prompt) {
        Alert.prompt('Reject Order', 'Reason (optional):', async (note) => {
          await respondToOrder(id, 'reject', note);
          fetch(true);
        });
      } else {
        await respondToOrder(id, 'reject');
        fetch(true);
      }
    } else {
      await respondToOrder(id, 'accept');
      fetch(true);
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 },
});
