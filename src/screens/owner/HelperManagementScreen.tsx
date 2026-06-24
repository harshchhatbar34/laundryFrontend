import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Switch, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getHelpers, toggleHelper } from '../../api/owner';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerSettingsStackParamList } from '../../navigation/OwnerTabs';

type Props = NativeStackScreenProps<OwnerSettingsStackParamList, 'HelperManagement'>;

export default function HelperManagementScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [helpers, setHelpers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try { const r = await getHelpers(); if (r?.data) setHelpers(Array.isArray(r.data) ? r.data : r.data.helpers || []); } catch (e) { console.log(e); }
  }, []);
  useEffect(() => { fetch(); }, []);
  useEffect(() => { const u = navigation.addListener('focus', fetch); return u; }, [navigation, fetch]);
  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

  const handleToggle = async (id: string, val: boolean) => { try { await toggleHelper(id, val); fetch(); } catch (e) { dispatch(showToast({ type: 'error', message: 'Failed to update helper status' })); } };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <FadeSlideIn delay={index * 60}>
      <Card style={{ marginBottom: 10 }} padding="medium">
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryBg }]}>
            <Ionicons name="person" size={20} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{item.name}</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{item.email}</Text>
          </View>
          <Switch value={item.isActive} onValueChange={(v) => handleToggle(item._id, v)}
            trackColor={{ false: theme.colors.border, true: theme.colors.success + '40' }}
            thumbColor={item.isActive ? theme.colors.success : theme.colors.textMuted} />
        </View>
      </Card>
    </FadeSlideIn>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Helpers" showBack onBack={() => navigation.goBack()} />
      <FlatList data={helpers} renderItem={renderItem} keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No helpers" description="Add your first helper" />}
      />
      <TouchableOpacity onPress={() => navigation.navigate('AddHelper')}
        style={[styles.fab, { backgroundColor: theme.colors.primary }, theme.shadows.primary as any]}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
