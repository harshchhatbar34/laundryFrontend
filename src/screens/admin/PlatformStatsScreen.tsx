import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, View, Text, StyleSheet } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { getPlatformStats } from '../../api/admin';
import { formatPrice } from '../../utils/helpers';

interface PlatformStatsScreenProps {
  navigation: any;
}

interface PlatformStats {
  totalOwners?: number;
  totalCustomers?: number;
  totalRevenue?: number;
  totalOrders?: number;
}

export default function PlatformStatsScreen({ navigation }: PlatformStatsScreenProps) {
  const { theme } = useTheme();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const r = await getPlatformStats();
      if (r?.data) {
        setStats(r.data.stats || r.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  };

  const StatRow = ({ icon, label, value, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string | number; color?: string }) => (
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

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Platform Stats" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}>
        <FadeSlideIn delay={0}><StatRow icon="people-outline" label="Total Owners" value={stats?.totalOwners || 0} /></FadeSlideIn>
        <FadeSlideIn delay={60}><StatRow icon="people-circle-outline" label="Total Customers" value={stats?.totalCustomers || 0} color="#F59E0B" /></FadeSlideIn>
        <FadeSlideIn delay={120}><StatRow icon="cash-outline" label="Total Revenue" value={formatPrice(stats?.totalRevenue || 0)} color={theme.colors.success} /></FadeSlideIn>
        <FadeSlideIn delay={180}><StatRow icon="receipt-outline" label="Total Orders" value={stats?.totalOrders || 0} color="#8B5CF6" /></FadeSlideIn>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
