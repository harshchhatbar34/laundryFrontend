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

type Props = NativeStackScreenProps<OwnerServiceStackParamList, 'ServiceManagement'>;

const TABS = ['Services', 'Materials', 'Items'];

export default function ServiceManagementScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [tab, setTab] = useState('Services');
  const [data, setData] = useState<{ services: any[]; materials: any[]; items: any[]; prices: any[] }>({ services: [], materials: [], items: [], prices: [] });

  const fetch = async () => {
    try { const r = await getOwnerServices(); if (r?.data) setData(r.data); } catch (e) { console.log(e); }
  };
  useEffect(() => { fetch(); }, []);
  useEffect(() => { const u = navigation.addListener('focus', fetch); return u; }, [navigation, fetch]);

  const handleDelete = (id: string, type: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'No' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteServiceElement(id, type); fetch(); } },
    ]);
  };

  const currentData = tab === 'Services' ? data.services : tab === 'Materials' ? data.materials : tab === 'Items' ? data.items : data.prices;
  const type = tab.toLowerCase().slice(0, -1) as 'service' | 'material' | 'item' | 'price';

  const renderItem = ({ item }: { item: any }) => (
    <Card style={{ marginBottom: 10 }} padding="medium">
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{item.name || `${item.serviceName} · ${item.materialName} · ${item.itemName}`}</Text>
          {item.description && <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{item.description}</Text>}
          {item.price != null && tab !== 'Services' && <Text style={[theme.typography.priceSmall, { color: theme.colors.primary, marginTop: 4 }]}>₹{item.price}</Text>}
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
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState icon="layers-outline" title={`No ${tab.toLowerCase()}`} />}
      />
      <TouchableOpacity onPress={() => navigation.navigate('AddServiceElement', { type })}
        style={[styles.fab, { backgroundColor: theme.colors.primary }, theme.shadows.primary as any]}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
