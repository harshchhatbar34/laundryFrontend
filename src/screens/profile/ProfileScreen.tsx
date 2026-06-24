import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import Divider from '../../components/ui/Divider';
import Input from '../../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { setTheme, ThemePreference } from '../../store/slices/themeSlice';
import { logout } from '../../store/slices/authSlice';
import { getProfile, updateProfile } from '../../api/user';
import { AppDispatch, RootState } from '../../store';

interface Props {
  navigation: any;
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  color?: string;
}

export default function ProfileScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const themePreference = useSelector((s: RootState) => s.theme.preference);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const handleSaveName = async () => {
    try { await updateProfile({ name }); setEditing(false); } catch (e) { console.log(e); }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout() as any) },
    ]);
  };

  const MenuItem = ({ icon, label, onPress, color }: MenuItemProps) => (
    <Card onPress={onPress} style={{ marginBottom: 8 }} padding="medium">
      <View style={styles.menuRow}>
        <View style={[styles.menuIcon, { backgroundColor: (color || theme.colors.primary) + '15' }]}>
          <Ionicons name={icon} size={20} color={color || theme.colors.primary} />
        </View>
        <Text style={[theme.typography.body, { color: color || theme.colors.textPrimary, flex: 1, marginLeft: 12 }]}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </Card>
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={styles.profileHeader}>
          <Avatar name={user?.name || ''} size={80} />
          <View style={{ marginLeft: 16, flex: 1 }}>
            {editing ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Input label="Name" value={name} onChangeText={setName} style={{ flex: 1, marginBottom: 0 }} />
                <Button title="Save" onPress={handleSaveName} size="small" fullWidth={false} style={{ marginLeft: 8 }} />
              </View>
            ) : (
              <>
                <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{user?.name}</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>{user?.email}</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.primary, marginTop: 4 }]}>{user?.role?.toUpperCase()}</Text>
              </>
            )}
          </View>
        </View>

        {!editing && (
          <Button title="Edit Name" onPress={() => setEditing(true)} variant="ghost" size="small"
            icon="create-outline" fullWidth={false} style={{ alignSelf: 'flex-end', marginTop: -8 }} />
        )}

        <Divider spacing={20} />

        {/* Theme Toggle */}
        <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginBottom: 12 }]}>Appearance</Text>
        <View style={styles.chipRow}>
          {(['light', 'dark', 'system'] as ThemePreference[]).map((t) => (
            <Chip key={t} label={t === 'light' ? '☀️ Light' : t === 'dark' ? '🌙 Dark' : '📱 System'}
              selected={themePreference === t} onPress={() => dispatch(setTheme(t) as any)} style={{ marginRight: 8 }} />
          ))}
        </View>

        <Divider spacing={20} />

        {user?.role === 'customer' && (
          <>
            <MenuItem icon="location-outline" label="My Addresses" onPress={() => navigation.navigate('AddressList')} />
            <MenuItem icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
          </>
        )}

        <Divider spacing={20} />

        <Button title="Logout" onPress={handleLogout} variant="danger" icon="log-out-outline" />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  chipRow: { flexDirection: 'row' },
  menuRow: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
