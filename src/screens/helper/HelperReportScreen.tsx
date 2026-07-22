// FreshWash — Helper Collection Report Screen
// Shows Cash vs UPI collections and details of completed orders.

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { getHelperStats, getHelperOrders } from '../../api/helper';
import { formatPrice, formatDate } from '../../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import FadeSlideIn from '../../animations/FadeSlideIn';

export default function HelperReportScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    cashCollected: 0,
    upiCollected: 0,
  });
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);

  const fetchReportData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        getHelperStats({ hideLoader: true }),
        getHelperOrders({ status: 'completed' }, { hideLoader: true }),
      ]);
      
      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (ordersRes?.data) {
        const list = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.orders || [];
        setCompletedOrders(list);
      }
    } catch (e) {
      console.error('[HelperReport] Error fetching stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReportData();
    }, [fetchReportData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportData(true);
  };

  const renderStatsCards = () => {
    return (
      <View style={styles.statsContainer}>
        {/* Cash vs UPI Row */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 1 }]} padding="medium">
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: '#DEF7EC' }]}>
                <Ionicons name="cash-outline" size={20} color="#0E9F6E" />
              </View>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Cash Collected</Text>
            </View>
            <Text style={[theme.typography.h2, { color: '#0E9F6E', marginTop: 8 }]}>
              {formatPrice(stats.cashCollected)}
            </Text>
          </Card>

          <Card style={[styles.statCard, { flex: 1 }]} padding="medium">
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: '#E1EFFE' }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#3F83F8" />
              </View>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>UPI Collected</Text>
            </View>
            <Text style={[theme.typography.h2, { color: '#3F83F8', marginTop: 8 }]}>
              {formatPrice(stats.upiCollected)}
            </Text>
          </Card>
        </View>

        {/* Deliveries vs Total Revenue */}
        <View style={[styles.statsRow, { marginTop: 12 }]}>
          <Card style={[styles.statCard, { flex: 1 }]} padding="medium">
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: '#EDEBFE' }]}>
                <Ionicons name="bicycle-outline" size={20} color="#6875F5" />
              </View>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Completed</Text>
            </View>
            <Text style={[theme.typography.h2, { color: '#6875F5', marginTop: 8 }]}>
              {stats.totalOrders}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 2 }]}>Deliveries</Text>
          </Card>

          <Card style={[styles.statCard, { flex: 1 }]} padding="medium">
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: '#FEF08A' }]}>
                <Ionicons name="wallet-outline" size={20} color="#A16207" />
              </View>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Total Collected</Text>
            </View>
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginTop: 8 }]}>
              {formatPrice(stats.totalRevenue)}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 2 }]}>Sum of all modes</Text>
          </Card>
        </View>
      </View>
    );
  };

  const renderOrderItem = ({ item, index }: { item: any; index: number }) => {
    const isUpi = item.paymentMethod === 'upi';
    const methodColor = isUpi ? '#3F83F8' : '#0E9F6E';
    const methodBg = isUpi ? '#E1EFFE' : '#DEF7EC';

    return (
      <FadeSlideIn delay={index * 40}>
        <Card style={styles.orderCard} padding="medium">
          <View style={styles.orderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>
                {item.orderNumber || `#${item._id?.slice(-6)}`}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                {item.customer?.name || 'Customer'} · {formatDate(item.createdAt)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[theme.typography.priceSmall, { color: theme.colors.textPrimary }]}>
                {formatPrice(item.pricing?.total || 0)}
              </Text>
              <View style={[styles.methodBadge, { backgroundColor: methodBg, marginTop: 4 }]}>
                <Text style={[styles.methodText, { color: methodColor }]}>
                  {item.paymentMethod?.toUpperCase() || 'CASH'}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </FadeSlideIn>
    );
  };

  return (
    <ScreenWrapper statusBarStyle="dark-content">
      <Header title="Collection Report" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        >
          {renderStatsCards()}

          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginHorizontal: 20, marginTop: 24, marginBottom: 12 }]}>
            Recent Deliveries
          </Text>

          {completedOrders.length === 0 ? (
            <View style={{ marginTop: 20 }}>
              <EmptyState
                icon="receipt-outline"
                title="No deliveries yet"
                description="Deliveries you complete will appear here with cash/upi breakdown."
              />
            </View>
          ) : (
            <FlatList
              data={completedOrders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false} // since it is inside a ScrollView
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          )}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingTop: 16 },
  statsContainer: { paddingHorizontal: 20 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  orderCard: { marginBottom: 10, elevation: 1 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  methodBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  methodText: { fontSize: 9, fontWeight: '700' },
});
