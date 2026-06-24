import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import SearchBar from '../../components/ui/SearchBar';
import { useTheme } from '../../theme/ThemeContext';
import { getTenants } from '../../api/admin';

interface TenantCodeScreenProps {
  navigation: any;
}

interface Tenant {
  _id: string;
  tenantCode: string;
  name: string;
  laundryName: string;
  isActive?: boolean;
}

export default function TenantCodeScreen({ navigation }: TenantCodeScreenProps) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const r = await getTenants();
      if (r?.data) {
        const rawTenants = Array.isArray(r.data) ? r.data : r.data.tenants || [];
        setTenants(rawTenants);
      }
    } catch (e) {
      console.log('Error fetching tenants:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    dispatch(showToast({ type: 'success', message: 'Code copied to clipboard!' }));
  };

  const filteredTenants = tenants.filter((tenant) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const name = (tenant.name || '').toLowerCase();
    const laundryName = (tenant.laundryName || '').toLowerCase();
    const tenantCode = (tenant.tenantCode || '').toLowerCase();

    return name.includes(q) || laundryName.includes(q) || tenantCode.includes(q);
  });

  const renderItem = ({ item }: { item: Tenant }) => (
    <Card style={{ marginBottom: 12 }} padding="medium">
      <View style={styles.row}>
        {/* Shop Avatar */}
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '10' }]}>
          <Ionicons name="business" size={20} color={theme.colors.primary} />
        </View>

        {/* Info */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '600' }]} numberOfLines={1}>
            {item.laundryName || 'Unnamed Laundry'}
          </Text>
          <View style={styles.ownerRow}>
            <Ionicons name="person-outline" size={12} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {item.name || 'No Owner'}
            </Text>
          </View>
        </View>

        {/* Tenant Code */}
        <TouchableOpacity
          onPress={() => copyCode(item.tenantCode)}
          style={[styles.codeBtn, { backgroundColor: theme.colors.primaryBg }]}
          activeOpacity={0.7}
        >
          <Text style={[theme.typography.label, { color: theme.colors.primary, fontWeight: '700' }]}>
            🔑 {item.tenantCode}
          </Text>
          <Ionicons name="copy-outline" size={13} color={theme.colors.primary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Tenant Codes" showBack onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <SearchBar
          placeholder="Search by name, laundry, or code..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          resultCount={filteredTenants.length}
        />
      </View>
      <FlatList
        data={filteredTenants}
        renderItem={renderItem}
        keyExtractor={(i) => i._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTenants} colors={[theme.colors.primary]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <EmptyState
            icon="key-outline"
            title={searchQuery ? "No Matching Tenants" : "No Tenant Codes"}
            description={searchQuery ? "Try refining your search query" : "Tenant codes are generated when creating owners"}
          />
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  ownerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)'
  },
});
