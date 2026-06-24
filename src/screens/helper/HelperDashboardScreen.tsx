import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Chip from '../../components/ui/Chip';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getHelperOrders, acceptOrder } from '../../api/helper';
import { getGreeting, formatDate, formatPrice } from '../../utils/helpers';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HelperStackParamList } from '../../navigation/HelperStack';
import { RootState } from '../../store';

type Props = NativeStackScreenProps<HelperStackParamList, 'HelperDashboard'>;

const FILTERS = [
  { label: 'New', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export default function HelperDashboardScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await getHelperOrders({ status: filter });
      if (res?.data) setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []);
    } catch (e) { console.log(e); }
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { const u = navigation.addListener('focus', fetch); return u; }, [navigation, fetch]);
  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

  const handleAccept = async (id: string) => {
    try { await acceptOrder(id); fetch(); } catch (e) { dispatch(showToast({ type: 'error', message: 'Failed to accept order' })); }
  };

  const renderOrder = ({ item, index }: { item: any; index: number }) => (
    <FadeSlideIn delay={index * 60}>
      <Card onPress={() => navigation.navigate('HelperOrderDetail', { orderId: item._id })} style={{ marginBottom: 12 }} padding="medium">
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
              {item.orderNumber || `#${item._id?.slice(-6)}`}
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
              {item.customer?.name || 'Customer'} · {formatDate(item.createdAt)}
            </Text>
            {item.deliveryAddress && (
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 4 }]} numberOfLines={1}>
                📍 {item.deliveryAddress.addressLine1 || item.deliveryAddress.city || ''}
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Badge status={item.status} size="small" />
            <Text style={[theme.typography.priceSmall, { color: theme.colors.primary, marginTop: 6 }]}>
              {formatPrice(item.pricing?.total || 0)}
            </Text>
          </View>
        </View>
        {item.status === 'pending' && (
          <Button title="Accept" onPress={() => handleAccept(item._id)} size="small"
            icon="checkmark-outline" style={{ marginTop: 10 }} />
        )}
      </Card>
    </FadeSlideIn>
  );

  return (
    <ScreenWrapper>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>{getGreeting()}</Text>
        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{user?.name || 'Helper'} 🛵</Text>
      </View>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Chip key={f.value} label={f.label} selected={filter === f.value}
            onPress={() => setFilter(f.value)} style={{ marginRight: 8 }} />
        ))}
      </View>
      <FlatList data={orders} renderItem={renderOrder} keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="bicycle-outline" title="No orders" description={`No ${filter} orders right now`} />}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8 },
});
