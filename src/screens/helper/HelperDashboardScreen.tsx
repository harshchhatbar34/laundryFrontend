import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HelperStackParamList, 'HelperDashboard'>;

const FILTERS = [
  { label: 'New', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export default function HelperDashboardScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);

  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async (silent = false) => {
    try {
      const res = await getHelperOrders({ status: filter }, silent ? { hideLoader: true } : undefined);
      if (res?.data) setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []);
    } catch (e) { console.log(e); }
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

  const handleAccept = async (id: string) => {
    try {
      const res = await acceptOrder(id);
      if (res?.success) {
        dispatch(showToast({ type: 'success', message: 'Order accepted' }));
        fetch();
      }
    } catch (e) {
      dispatch(showToast({ type: 'error', message: 'Failed to accept order' }));
    }
  };

  const openCustomerNavigation = (addrObj: any) => {
    if (!addrObj) return;
    const lat = addrObj.latitude || addrObj.lat || (addrObj.location?.coordinates && addrObj.location.coordinates[1]);
    const lng = addrObj.longitude || addrObj.lng || (addrObj.location?.coordinates && addrObj.location.coordinates[0]);

    let url = '';
    if (lat && lng) {
      url = Platform.OS === 'ios'
        ? `maps://app?daddr=${lat},${lng}`
        : `google.navigation:q=${lat},${lng}`;
    } else {
      const addressString = encodeURIComponent(
        `${addrObj.addressLine1 || ''}, ${addrObj.addressLine2 || ''}, ${addrObj.city || ''}, ${addrObj.pincode || ''}`
      );
      url = Platform.OS === 'ios'
        ? `maps://app?daddr=${addressString}`
        : `https://www.google.com/maps/search/?api=1&query=${addressString}`;
    }

    Linking.openURL(url).catch(() => {
      dispatch(showToast({ type: 'error', message: 'Could not open maps application' }));
    });
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
            {(item.address || item.deliveryAddress) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={[theme.typography.caption, { color: theme.colors.textMuted, flex: 1 }]} numberOfLines={1}>
                  📍 {(item.address || item.deliveryAddress).addressLine1 || (item.address || item.deliveryAddress).city || ''}
                </Text>
                <TouchableOpacity
                  onPress={(e: any) => {
                    e.stopPropagation?.();
                    openCustomerNavigation(item.address || item.deliveryAddress);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F615', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 3, marginLeft: 6 }}
                >
                  <Ionicons name="navigate-outline" size={12} color="#3B82F6" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#3B82F6' }}>Navigate</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <View>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>{getGreeting()}</Text>
          <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{user?.name || 'Helper'} 🛵</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: theme.colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.primary + '30',
          }}
        >
          <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Chip key={f.value} label={f.label} selected={filter === f.value}
            onPress={() => setFilter(f.value)} style={{ marginRight: 8 }} />
        ))}
      </View>
      <FlatList data={orders} renderItem={renderOrder} keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom }}
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
