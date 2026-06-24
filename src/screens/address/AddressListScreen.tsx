import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import FadeSlideIn from '../../animations/FadeSlideIn';
import { useTheme } from '../../theme/ThemeContext';
import { getAddresses, deleteAddress } from '../../api/user';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/CustomerTabs';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddressList'>;

export default function AddressListScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const isSelecting = (route.params as any)?.isSelecting;

  const fetch = useCallback(async () => {
    try {
      const res = await getAddresses();
      if (res?.data) setAddresses(Array.isArray(res.data) ? res.data : res.data.addresses || []);
    } catch (e) { console.log(e); }
  }, []);

  useEffect(() => { fetch(); }, []);
  useEffect(() => { const u = navigation.addListener('focus', fetch); return u; }, [navigation, fetch]);
  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'No' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteAddress(id); fetch(); } },
    ]);
  };

  const handleSelectAddress = (item: any) => {
    if (isSelecting) {
      (navigation as any).navigate('Home', {
        screen: 'Cart',
        params: { selectedAddress: item }
      });
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <FadeSlideIn delay={index * 60}>
      <TouchableOpacity
        activeOpacity={isSelecting ? 0.7 : 1}
        onPress={() => handleSelectAddress(item)}
        disabled={!isSelecting}
      >
        <Card style={{ marginBottom: 12 }} padding="medium">
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryBg }]}>
              <Ionicons name="location" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textPrimary }]}>{item.label || 'Address'}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                {item.addressLine1}{item.city ? `, ${item.city}` : ''}{item.pincode ? ` - ${item.pincode}` : ''}
              </Text>
            </View>
            {!isSelecting && (
              <TouchableOpacity onPress={() => handleDelete(item._id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    </FadeSlideIn>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title={isSelecting ? "Select Address" : "My Addresses"} showBack onBack={() => navigation.goBack()} />
      <FlatList data={addresses} renderItem={renderItem} keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="location-outline" title="No addresses" description="Add your first delivery address" />}
      />
      <View style={{ position: 'absolute', bottom: 24, right: 24 }}>
        <TouchableOpacity onPress={() => navigation.navigate('AddAddress')}
          style={[styles.fab, { backgroundColor: theme.colors.primary }, theme.shadows.primary as any]}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
