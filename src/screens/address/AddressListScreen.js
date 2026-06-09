import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import ThemedButton from '../../components/ThemedButton';
import api from '../../api/axiosInstance';
import WatermarkView from '../../components/WatermarkView';

export default function AddressListScreen({ navigation }) {
  const { theme } = useTheme();
  const { colors, spacing, typography, radius } = theme;
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/users/addresses').then(({ data }) => setAddresses(data.data.addresses || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        api.delete(`/users/addresses/${id}`).then(load);
      }},
    ]);
  };

  const handleSetDefault = (id) => {
    api.patch(`/users/addresses/${id}/default`).then(load);
  };

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.md }}>
      <WatermarkView />
      <FlatList
        data={addresses}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: item.isDefault ? colors.primary : colors.border, marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[typography.label, { color: colors.primary }]}>{item.label}</Text>
              {item.isDefault && <View style={{ backgroundColor: colors.primary + '20', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}><Text style={[typography.caption, { color: colors.primary }]}>Default</Text></View>}
            </View>

            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.apartmentNo ? `${item.apartmentNo}, ` : ''}{item.buildingVilla}, {item.area}, {item.emirate}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
              {!item.isDefault && <TouchableOpacity onPress={() => handleSetDefault(item._id)}><Text style={[typography.caption, { color: colors.primary }]}>Set Default</Text></TouchableOpacity>}
              <TouchableOpacity onPress={() => handleDelete(item._id)}><Text style={[typography.caption, { color: colors.error }]}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 48 }]}>No addresses saved</Text>}
      />
      <ThemedButton label="+ Add New Address" onPress={() => navigation.navigate('AddAddress', { onGoBack: load })} style={{ marginTop: spacing.sm }} />
    </View>
  );
}
