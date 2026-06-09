import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/axiosInstance';
import ThemedCard from '../../components/ThemedCard';
import WatermarkView from '../../components/WatermarkView';
import { logout } from '../../store/authSlice';
import { useTheme } from '../../theme/ThemeProvider';

const STATUS_LABELS = {
  confirmed: { label: 'Awaiting Pickup', color: '#3B82F6' },
  pickup: { label: 'Picking Up', color: '#8B5CF6' },
  received: { label: 'At Facility', color: '#F59E0B' },
  processing: { label: 'Processing', color: '#F59E0B' },
  ready: { label: 'Ready for Delivery', color: '#10B981' },
  out_delivery: { label: 'Out for Delivery', color: '#6366F1' },
  delivered: { label: 'Delivered', color: '#10B981' },
};

function OrderCard({ order, onPress, theme }) {
  const { colors, spacing, typography, radius } = theme;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: colors.textMuted };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
        onPress={() => onPress(order)}
      >
        <ThemedCard style={{ marginBottom: spacing.md }}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[typography.h3, { color: colors.text }]}>{order.orderNumber}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {new Date(order.createdAt).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
              <Text style={[typography.caption, { color: statusInfo.color, fontWeight: '700' }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <Text style={{ fontSize: 20 }}>👤</Text>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[typography.label, { color: colors.text }]}>{order.user?.name || 'Customer'}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{order.user?.mobileNumber}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={{ fontSize: 20 }}>📍</Text>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={2}>
                {order.address?.buildingVilla}, {order.address?.area}, {order.address?.emirate}
              </Text>
            </View>
          </View>

          <View style={[styles.footer, { backgroundColor: colors.surfaceVariant, borderRadius: radius.md }]}>
            <Text style={[typography.label, { color: colors.textSecondary }]}>
              {order.items?.length || 0} items · {order.paymentMethod?.toUpperCase()}
            </Text>
            <Text style={[typography.h3, { color: colors.primary }]}>AED {order.pricing?.total?.toFixed(2)}</Text>
          </View>
        </ThemedCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DriverDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius, gradients } = theme;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('active');

  const FILTERS = [
    { key: 'active', label: 'Active', statuses: ['confirmed', 'pickup', 'received', 'ready', 'out_delivery'] },
    { key: 'delivered', label: 'Completed', statuses: ['delivered'] },
  ];

  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await api.get('/orders/driver/assigned');
      setOrders(data.data || []);
    } catch {
      Alert.alert('Error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    const filter = FILTERS.find((f) => f.key === activeFilter);
    return filter?.statuses.includes(o.status);
  });

  const activeCount = orders.filter((o) =>
    ['confirmed', 'pickup', 'received', 'ready', 'out_delivery'].includes(o.status)
  ).length;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WatermarkView />
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        style={[styles.header, { paddingTop: 50, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.7)' }]}>Welcome back</Text>
            <Text style={[typography.h2, { color: '#FFFFFF' }]}>{user?.name || 'Driver'}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18 }}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={[styles.statsRow, { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.md }]}>
          <View style={styles.statItem}>
            <Text style={[typography.h2, { color: '#FFFFFF' }]}>{activeCount}</Text>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.8)' }]}>Active</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.statItem}>
            <Text style={[typography.h2, { color: '#FFFFFF' }]}>
              {orders.filter((o) => o.status === 'delivered').length}
            </Text>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.8)' }]}>Delivered</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.statItem}>
            <Text style={[typography.h2, { color: '#FFFFFF' }]}>{orders.length}</Text>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.8)' }]}>Total</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter tabs */}
      <View style={[styles.filterRow, { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            style={[
              styles.filterTab,
              { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
              activeFilter === f.key ? { backgroundColor: colors.primary } : { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <Text style={[typography.label, { color: activeFilter === f.key ? '#FFFFFF' : colors.textSecondary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} colors={[colors.primary]} />}
          ListEmptyComponent={
            <ThemedCard variant="outline" style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
              <Text style={[typography.h3, { color: colors.textSecondary, textAlign: 'center' }]}>
                No {activeFilter === 'active' ? 'active' : 'completed'} orders
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textMuted, textAlign: 'center', marginTop: 4 }]}>
                Pull down to refresh
              </Text>
            </ThemedCard>
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              theme={theme}
              onPress={(order) => navigation.navigate('DriverOrderDetail', { orderId: order._id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', padding: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, marginHorizontal: 8 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  divider: { height: 1, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, marginTop: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
