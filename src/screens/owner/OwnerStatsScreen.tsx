import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getStats, getBranches, getOwnerReviews } from '../../api/owner';
import { formatPrice } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerSettingsStackParamList } from '../../navigation/OwnerTabs';

type Props = NativeStackScreenProps<OwnerSettingsStackParamList, 'OwnerStats'>;

interface StatRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
}

export default function OwnerStatsScreen({ route, navigation }: Props) {
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Tab state: 'overview' (Analytics) or 'reviews' (Reviews)
  const [tab, setTab] = useState<'overview' | 'reviews'>(route.params?.activeTab || 'overview');

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Sync tab parameter if it changes dynamically
  useEffect(() => {
    if (route.params?.activeTab) {
      setTab(route.params.activeTab);
    }
  }, [route.params?.activeTab]);

  const fetchStats = async () => {
    try {
      const branchesRes = await getBranches();
      const branches = branchesRes?.data || [];
      if (branches.length > 0) {
        const r = await getStats(branches[0]._id);
        if (r?.data) setStats(r.data.stats || r.data);
      } else {
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          activeHelpers: 0,
          avgRating: 0,
          completedOrders: 0,
          cancelledOrders: 0,
        });
      }
    } catch (e) {
      console.log('Failed to fetch stats:', e);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await getOwnerReviews();
      if (res?.data?.ratings) {
        setReviews(res.data.ratings);
      }
    } catch (e) {
      console.log('Failed to fetch reviews:', e);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'overview') {
      fetchStats();
    } else {
      fetchReviews();
    }
  }, [tab]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (tab === 'overview') {
      await fetchStats();
    } else {
      await fetchReviews();
    }
    setRefreshing(false);
  };

  const StatRow = ({ icon, label, value, color }: StatRowProps) => (
    <Card style={{ marginBottom: 10 }} padding="medium">
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: (color || theme.colors.primary) + '15' }]}>
          <Ionicons name={icon} size={20} color={color || theme.colors.primary} />
        </View>
        <Text style={[theme.typography.body, { color: theme.colors.textPrimary, flex: 1, marginLeft: 12 }]}>{label}</Text>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>{value}</Text>
      </View>
    </Card>
  );

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color="#F59E0B"
          style={{ marginRight: 1 }}
        />
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header 
        title={tab === 'overview' ? 'Analytics Overview' : 'Customer Reviews'} 
        showBack 
        onBack={() => navigation.goBack()} 
      />

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.borderLight }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setTab('overview')}
          style={[styles.tabItem, tab === 'overview' && { borderBottomColor: theme.colors.primary }]}
        >
          <Text style={[
            theme.typography.body, 
            { fontWeight: '600' },
            tab === 'overview' ? { color: theme.colors.primary } : { color: theme.colors.textSecondary }
          ]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setTab('reviews')}
          style={[styles.tabItem, tab === 'reviews' && { borderBottomColor: theme.colors.primary }]}
        >
          <Text style={[
            theme.typography.body, 
            { fontWeight: '600' },
            tab === 'reviews' ? { color: theme.colors.primary } : { color: theme.colors.textSecondary }
          ]}>
            Reviews
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scroll Content */}
      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {tab === 'overview' ? (
          <View>
            <FadeSlideIn delay={0}><StatRow icon="receipt-outline" label="Total Orders" value={stats?.totalOrders || 0} /></FadeSlideIn>
            <FadeSlideIn delay={60}><StatRow icon="cash-outline" label="Revenue" value={formatPrice(stats?.totalRevenue || 0)} color={theme.colors.success} /></FadeSlideIn>
            <FadeSlideIn delay={120}><StatRow icon="people-outline" label="Active Helpers" value={stats?.activeHelpers || 0} color="#8B5CF6" /></FadeSlideIn>
            <FadeSlideIn delay={180}><StatRow icon="star-outline" label="Avg Rating" value={stats?.avgRating?.toFixed(1) || '0.0'} color="#F59E0B" /></FadeSlideIn>
            <FadeSlideIn delay={240}><StatRow icon="checkmark-done-outline" label="Completed" value={stats?.completedOrders || 0} color={theme.colors.success} /></FadeSlideIn>
            <FadeSlideIn delay={300}><StatRow icon="close-circle-outline" label="Cancelled" value={stats?.cancelledOrders || 0} color={theme.colors.error} /></FadeSlideIn>
          </View>
        ) : (
          <View>
            {reviewsLoading && reviews.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : reviews.length > 0 ? (
              reviews.map((item, index) => (
                <FadeSlideIn key={item._id} delay={index * 50}>
                  <Card style={{ marginBottom: 12 }} padding="medium">
                    <View style={styles.reviewHeader}>
                      <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '12' }]}>
                        <Text style={[theme.typography.body, { color: theme.colors.primary, fontWeight: '700' }]}>
                          {item.customer?.name?.charAt(0).toUpperCase() || 'C'}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[theme.typography.label, { color: theme.colors.textPrimary, fontWeight: '600' }]}>
                          {item.customer?.name || 'Customer'}
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Text>
                      </View>
                      {renderStars(item.rating)}
                    </View>
                    {item.review ? (
                      <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 10, fontStyle: 'italic', lineHeight: 20 }]}>
                        "{item.review}"
                      </Text>
                    ) : (
                      <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 10, fontStyle: 'italic' }]}>
                        No comments left
                      </Text>
                    )}
                  </Card>
                </FadeSlideIn>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="star-half-outline" size={48} color={theme.colors.textMuted} />
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 12, textAlign: 'center' }]}>
                  No reviews submitted yet
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
