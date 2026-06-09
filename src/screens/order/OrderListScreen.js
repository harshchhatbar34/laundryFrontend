import { useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import WatermarkView from '../../components/WatermarkView';
import { fetchOrders } from '../../store/orderSlice';
import { useTheme } from '../../theme/ThemeProvider';

const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  pickup: '#8B5CF6',
  received: '#6366F1',
  processing: '#8B5CF6',
  ready: '#10B981',
  out_delivery: '#06B6D4',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const STATUS_ICONS = {
  pending: '📋', confirmed: '✅', pickup: '🚗', received: '📦',
  processing: '🫧', ready: '✨', out_delivery: '🚚', delivered: '🎉', cancelled: '❌',
};

export default function OrderListScreen({ navigation }) {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchOrders());
    }, [dispatch])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.card, borderRadius: radius.lg, borderColor: colors.border, marginBottom: spacing.sm }]}
    >
      <View style={styles.row}>
        <Text style={{ fontSize: 28 }}>{item.service?.icon || '👕'}</Text>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
            {item.orderNumber}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            {item.service?.name} · ₹{item.pricing?.total}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[item.status] || colors.primary) + '20' }]}>
          <Text style={{ fontSize: 14 }}>{STATUS_ICONS[item.status] || '📋'}</Text>
          <Text style={[typography.caption, { color: STATUS_COLORS[item.status] || colors.primary, fontWeight: '600', marginTop: 2 }]}>
            {item.status?.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WatermarkView />
      <FlatList
        data={orders}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.md, backgroundColor: colors.background, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 56 }}>📭</Text>
            <Text style={[typography.h3, { color: colors.text, marginTop: spacing.md }]}>No Orders Yet</Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
              Place your first laundry order and track it here!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: { alignItems: 'center', borderRadius: 8, padding: 8, minWidth: 70 },
});
