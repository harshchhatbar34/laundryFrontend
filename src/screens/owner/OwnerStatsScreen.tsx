import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getStats, getBranches } from '../../api/owner';
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

export default function OwnerStatsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
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
      console.log(e);
    }
  };
  useEffect(() => { fetch(); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

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

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Analytics" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}>
        <FadeSlideIn delay={0}><StatRow icon="receipt-outline" label="Total Orders" value={stats?.totalOrders || 0} /></FadeSlideIn>
        <FadeSlideIn delay={60}><StatRow icon="cash-outline" label="Revenue" value={formatPrice(stats?.totalRevenue || 0)} color={theme.colors.success} /></FadeSlideIn>
        <FadeSlideIn delay={120}><StatRow icon="people-outline" label="Active Helpers" value={stats?.activeHelpers || 0} color="#8B5CF6" /></FadeSlideIn>
        <FadeSlideIn delay={180}><StatRow icon="star-outline" label="Avg Rating" value={stats?.avgRating?.toFixed(1) || '0.0'} color="#F59E0B" /></FadeSlideIn>
        <FadeSlideIn delay={240}><StatRow icon="checkmark-done-outline" label="Completed" value={stats?.completedOrders || 0} color={theme.colors.success} /></FadeSlideIn>
        <FadeSlideIn delay={300}><StatRow icon="close-circle-outline" label="Cancelled" value={stats?.cancelledOrders || 0} color={theme.colors.error} /></FadeSlideIn>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
