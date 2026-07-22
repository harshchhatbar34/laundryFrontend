// LaundroFlow — OwnerCustomerManagementScreen
// Lists all customers who have placed orders under this owner's branches.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  RefreshControl, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import SearchBar from '../../components/ui/SearchBar';
import { useTheme } from '../../theme/ThemeContext';
import { formatDate } from '../../utils/helpers';
import { getOwnerCustomers } from '../../api/owner';

export default function OwnerCustomerManagementScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = useCallback(async () => {
    try {
      const r = await getOwnerCustomers();
      const list = Array.isArray(r?.data) ? r.data : r?.data?.customers || [];
      setCustomers(list);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.mobileNumber?.includes(q)
    );
  });

  const getInitial = (name: string) => (name || '?').charAt(0).toUpperCase();

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card} padding="medium">
      <View style={styles.row}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
            {getInitial(item.name)}
          </Text>
        </View>
        {/* Info */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.nameRow}>
            <Text style={[theme.typography.labelMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[
              styles.badge,
              { backgroundColor: item.isActive ? theme.colors.success + '20' : theme.colors.error + '20' },
            ]}>
              <Text style={[
                styles.badgeText,
                { color: item.isActive ? theme.colors.success : theme.colors.error },
              ]}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
            {item.email}
          </Text>
          {item.mobileNumber ? (
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
              📞 {item.mobileNumber}
            </Text>
          ) : null}
          {item.createdAt ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 4 }]}>
              Joined {formatDate(item.createdAt)}
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper>
      <Header title="Customers" onBack={() => navigation.goBack()} />
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, email or mobile..."
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No Customers Found"
              description={searchQuery ? 'Try a different search term.' : 'No customers have placed orders yet.'}
            />
          }
          ListHeaderComponent={
            filtered.length > 0 ? (
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginBottom: 8 }]}>
                {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
              </Text>
            ) : null
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
