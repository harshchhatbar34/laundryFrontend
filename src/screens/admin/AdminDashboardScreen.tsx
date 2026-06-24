import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Card from '../../components/ui/Card';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getPlatformStats } from '../../api/admin';
import { formatPrice } from '../../utils/helpers';

interface Props {
  navigation: any;
}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  delay: number;
}

export default function AdminDashboardScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => { try { const r = await getPlatformStats(); if (r?.data) setStats(r.data.stats || r.data); } catch (e) { console.log(e); } };
  useEffect(() => { fetch(); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

  const StatCard = ({ icon, label, value, color, delay }: StatCardProps) => (
    <FadeSlideIn delay={delay} style={{ flex: 1, margin: 4 }}>
      <Card padding="medium" style={{ alignItems: 'center' }}>
        <View style={[styles.statIcon, { backgroundColor: (color || theme.colors.primary) + '15' }]}>
          <Ionicons name={icon} size={22} color={color || theme.colors.primary} />
        </View>
        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginTop: 8 }]}>{value}</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>{label}</Text>
      </Card>
    </FadeSlideIn>
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}>
        <Text style={[theme.typography.h1, { color: theme.colors.textPrimary, marginBottom: 4 }]}>Admin Panel</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 20 }]}>Platform overview</Text>
        <View style={{ flexDirection: 'row' }}>
          <StatCard icon="people-outline" label="Owners" value={stats?.totalOwners || 0} delay={0} />
          <StatCard icon="people-circle-outline" label="Customers" value={stats?.totalCustomers || 0} color="#F59E0B" delay={100} />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          <StatCard icon="cash-outline" label="Revenue" value={formatPrice(stats?.totalRevenue || 0)} color={theme.colors.success} delay={200} />
          <StatCard icon="receipt-outline" label="Orders" value={stats?.totalOrders || 0} color="#8B5CF6" delay={300} />
        </View>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 28, marginBottom: 12 }]}>Quick Actions</Text>
        {([
          { icon: 'people-outline' as const, label: 'Manage Owners', tab: 'Owners', screen: 'OwnerManagement', color: theme.colors.primary },
          { icon: 'key-outline' as const, label: 'Tenant Codes', tab: 'Owners', screen: 'TenantCode', color: '#F59E0B' },
        ]).map((a, i) => (
          <FadeSlideIn key={a.screen} delay={400 + i * 60}>
            <Card onPress={() => navigation.navigate(a.tab, { screen: a.screen })} style={{ marginBottom: 8 }} padding="medium">
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
