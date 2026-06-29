import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Card from '../../components/ui/Card';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getStats, getBranches } from '../../api/owner';
import { formatPrice } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  delay: number;
  theme: any;
  onPress?: () => void;
}

const StatCard = React.memo(({ icon, label, value, color, delay, theme, onPress }: StatCardProps) => (
  <FadeSlideIn delay={delay} style={{ flex: 1, margin: 4 }}>
    <Card padding="medium" style={{ alignItems: 'center' }} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: (color || theme.colors.primary) + '15' }]}>
        <Ionicons name={icon} size={22} color={color || theme.colors.primary} />
      </View>
      <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginTop: 8 }]}>{value}</Text>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>{label}</Text>
    </Card>
  </FadeSlideIn>
));

export default function OwnerDashboardScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async (isSilent = false) => {
    try {
      const res = await getStats(undefined, isSilent ? { hideLoader: true } : undefined);
      if (res?.data) {
        setStats(res.data.stats || res.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetch(false);

      // Poll every 15 seconds silently while focused
      const interval = setInterval(() => fetch(true), 15000);
      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = async () => { setRefreshing(true); await fetch(false); setRefreshing(false); };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}>
        <Text style={[theme.typography.h1, { color: theme.colors.textPrimary, marginBottom: 4 }]}>Dashboard</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 20 }]}>Business overview</Text>

        <View style={{ flexDirection: 'row' }}>
          <StatCard icon="receipt-outline" label="Orders" value={stats?.totalOrders || 0} delay={0} theme={theme} onPress={() => navigation.navigate('Orders')} />
          <StatCard icon="cash-outline" label="Revenue" value={formatPrice(stats?.totalRevenue || 0)} color={theme.colors.success} delay={100} theme={theme} />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          <StatCard icon="people-outline" label="Helpers" value={stats?.activeHelpers || 0} color="#8B5CF6" delay={200} theme={theme} onPress={() => navigation.navigate('Settings', { screen: 'HelperManagement' })} />
          <StatCard icon="star-outline" label="Rating" value={stats?.avgRating?.toFixed(1) || '0.0'} color="#F59E0B" delay={300} theme={theme} onPress={() => navigation.navigate('Settings', { screen: 'OwnerStats', params: { activeTab: 'reviews' } })} />
        </View>

        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 28, marginBottom: 12 }]}>Quick Actions</Text>
        {([
          { icon: 'storefront-outline' as const, label: 'Manage Branches', tab: 'Branches', screen: 'BranchList', color: theme.colors.primary },
          { icon: 'people-outline' as const, label: 'Manage Helpers', tab: 'Settings', screen: 'HelperManagement', color: '#10B981' },
          { icon: 'people-circle-outline' as const, label: 'Manage Customers', tab: 'Settings', screen: 'CustomerManagement', color: '#E11D48' },
          { icon: 'star-outline' as const, label: 'Ratings & Reviews', tab: 'Settings', screen: 'OwnerStats', params: { activeTab: 'reviews' }, color: '#F59E0B' },
          { icon: 'settings-outline' as const, label: 'Settings & UPI', tab: 'Settings', screen: 'OwnerSettingsMain', color: '#8B5CF6' },
        ]).map((a, i) => (
          <FadeSlideIn key={a.screen} delay={400 + i * 60}>
            <Card onPress={() => navigation.navigate(a.tab, { screen: a.screen, params: a.params })} style={{ marginBottom: 8 }} padding="medium">
              <View style={styles.actionRow}>
                <View style={[styles.actionIcon, { backgroundColor: a.color + '15' }]}>
                  <Ionicons name={a.icon} size={20} color={a.color} />
                </View>
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary, flex: 1, marginLeft: 12 }]}>{a.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </View>
            </Card>
          </FadeSlideIn>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
