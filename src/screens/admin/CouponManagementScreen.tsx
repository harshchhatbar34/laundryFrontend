import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getCoupons, deleteCoupon } from '../../api/admin';
import { formatDate } from '../../utils/helpers';

interface CouponManagementScreenProps {
  navigation: any;
}

interface Coupon {
  _id: string;
  code: string;
  isActive: boolean;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validUntil?: string;
}

export default function CouponManagementScreen({ navigation }: CouponManagementScreenProps) {
  const { theme } = useTheme();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const r = await getCoupons();
      if (r?.data) {
        const rawCoupons = Array.isArray(r.data) ? r.data : r.data.coupons || [];
        const seen = new Set();
        const deduped = rawCoupons.filter((c: any) => {
          if (!c?._id) return false;
          if (seen.has(c._id)) return false;
          seen.add(c._id);
          return true;
        });
        setCoupons(deduped);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    const u = navigation.addListener('focus', fetch);
    return u;
  }, [navigation, fetch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Coupon', 'Are you sure?', [
      { text: 'No' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteCoupon(id); fetch(); } },
    ]);
  };

  const renderItem = ({ item, index }: { item: Coupon; index: number }) => (
    <FadeSlideIn delay={index * 60}>
      <Card style={{ marginBottom: 10 }} padding="medium">
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[theme.typography.h4, { color: theme.colors.primary }]}>🎟️ {item.code}</Text>
              {item.isActive && <Badge label="Active" color={theme.colors.success} size="small" style={{ marginLeft: 8 }} />}
            </View>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 4 }]}>
              {item.discountType === 'percentage' ? `${item.discountValue}% off` : `₹${item.discountValue} off`}
            </Text>
            {item.validUntil && (
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 2 }]}>
                Valid until {formatDate(item.validUntil)}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => navigation.navigate('AddCoupon', { editItem: item })}>
              <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </FadeSlideIn>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Coupons" showBack onBack={() => navigation.goBack()} />
      <FlatList data={coupons} renderItem={renderItem} keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="pricetag-outline" title="No coupons" />}
      />
      <TouchableOpacity onPress={() => navigation.navigate('AddCoupon', {})}
        style={[styles.fab, { backgroundColor: theme.colors.primary }, theme.shadows.primary]}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
