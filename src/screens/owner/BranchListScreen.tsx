import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Switch, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PulseGlow from '../../animations/PulseGlow';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getBranches, toggleBranchStatus } from '../../api/owner';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerBranchStackParamList } from '../../navigation/OwnerTabs';

type Props = NativeStackScreenProps<OwnerBranchStackParamList, 'BranchList'>;

export default function BranchListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [branches, setBranches] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try { const r = await getBranches(); if (r?.data) setBranches(Array.isArray(r.data) ? r.data : r.data.branches || []); } catch (e) { console.log(e); }
  }, []);
  useEffect(() => { fetch(); }, []);
  useEffect(() => { const u = navigation.addListener('focus', fetch); return u; }, [navigation, fetch]);
  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

  const handleToggle = async (id: string, val: boolean) => {
    try { await toggleBranchStatus(id, val); fetch(); }
    catch (e) { dispatch(showToast({ type: 'error', message: 'Failed to update status' })); }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <FadeSlideIn delay={index * 60}>
      <Card style={{ marginBottom: 12 }} padding="medium">
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{item.name}</Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
              {item.addressLine}, {item.city}
            </Text>
            {item.phone && <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 2 }]}>📞 {item.phone}</Text>}
          </View>
          <View style={{ alignItems: 'center' }}>
            {item.isLive && <PulseGlow size={8} color={theme.colors.success} />}
            <Switch value={item.isLive} onValueChange={(v) => handleToggle(item._id, v)}
              trackColor={{ false: theme.colors.border, true: theme.colors.success + '40' }}
              thumbColor={item.isLive ? theme.colors.success : theme.colors.textMuted} />
            <Text style={[theme.typography.caption, { color: item.isLive ? theme.colors.success : theme.colors.textMuted }]}>
              {item.isLive ? 'Live' : 'Closed'}
            </Text>
          </View>
        </View>
      </Card>
    </FadeSlideIn>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Branches" showBack onBack={() => navigation.goBack()} />
      <FlatList data={branches} renderItem={renderItem} keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="storefront-outline" title="No branches" description="Add your first branch" />}
      />
      <TouchableOpacity onPress={() => navigation.navigate('AddBranch')}
        style={[styles.fab, { backgroundColor: theme.colors.primary }, theme.shadows.primary as any]}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
