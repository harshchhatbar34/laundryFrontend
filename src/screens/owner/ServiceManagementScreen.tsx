import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import { useTheme } from '../../theme/ThemeContext';
import { getServices as getOwnerServices, deleteServiceElement } from '../../api/owner';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerServiceStackParamList } from '../../navigation/OwnerTabs';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<OwnerServiceStackParamList, 'ServiceManagement'>;

const TABS = ['Services', 'Items'];

export default function ServiceManagementScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('Services');
  const [data, setData] = useState<{ services: any[]; items: any[] }>({ services: [], items: [] });

  const fetch = async (isSilent = false) => {
    try {
      const r = await getOwnerServices(isSilent ? { hideLoader: true } : undefined);
      if (r?.data) setData(r.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const hasData = data.services.length > 0 || data.items.length > 0;
    fetch(hasData);
    const u = navigation.addListener('focus', () => {
      fetch(true); // silent fetch on menu focus
    });
    return u;
  }, [navigation]);

  const handleDelete = (id: string, type: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'No' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteServiceElement(id, type); fetch(); } },
    ]);
  };

  const currentData = tab === 'Services' ? data.services : data.items;
  const type = (tab === 'Services' ? 'service' : 'item') as 'service' | 'item';

  const renderItem = ({ item }: { item: any }) => (
    <Card style={{ marginBottom: 10 }} padding="medium">
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{item.name || item.serviceName || item.itemName}</Text>
            {tab === 'Services' && item.discount > 0 && (
              <View style={{ backgroundColor: theme.colors.success + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: theme.colors.success, fontSize: 11, fontWeight: '700' }}>{item.discount}% OFF</Text>
              </View>
            )}
          </View>
          {item.description && <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{item.description}</Text>}
          {tab === 'Services' && item.items && item.items.length > 0 && (
            <Text style={[theme.typography.captionSmall, { color: theme.colors.textMuted, marginTop: 2 }]}>
              {item.items.length} {item.items.length === 1 ? 'item' : 'items'} configured in table
            </Text>
          )}
          {tab !== 'Services' && item.price != null && (
            <Text style={[theme.typography.priceSmall, { color: theme.colors.primary, marginTop: 4 }]}>
              ₹{item.price}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddServiceElement', { type, editItem: item })} style={{ padding: 8 }}>
          <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id, type)} style={{ padding: 8 }}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Services & Pricing" showBack onBack={() => navigation.goBack()} />
      <View style={styles.tabRow}>
        {TABS.map((t) => <Chip key={t} label={t} selected={tab === t} onPress={() => setTab(t)} style={{ marginRight: 8 }} />)}
      </View>
      <FlatList data={currentData || []} renderItem={renderItem} keyExtractor={(i) => i._id || Math.random().toString()}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState icon="layers-outline" title={`No ${tab.toLowerCase()}`} />}
      />
      <TouchableOpacity onPress={() => navigation.navigate('AddServiceElement', { type })}
        style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: 84 + insets.bottom, right: 24 }, theme.shadows.primary as any]}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  fab: { position: 'absolute', right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', zIndex: 999, elevation: 8 },
});
