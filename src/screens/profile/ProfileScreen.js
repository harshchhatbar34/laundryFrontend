import { LinearGradient } from 'expo-linear-gradient';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import { logout } from '../../store/authSlice';
import { useTheme } from '../../theme/ThemeProvider';
import WatermarkView from '../../components/WatermarkView';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const { colors, spacing, typography, radius, shadow } = theme;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const MenuTile = ({ icon, title, subtitle, onPress, color = colors.primary, isLast }) => (
    <TouchableOpacity
      style={[styles.menuTile, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>{title}</Text>
        {subtitle && <Text style={[typography.caption, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WatermarkView />
      <StatusBar barStyle="light-content" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={theme.gradients.primary}
          style={[styles.header, { paddingBottom: spacing.xxl + 20 }]}
        >
          <View style={styles.headerTop}>
            <Text style={[typography.h3, { color: '#FFFFFF' }]}>Profile</Text>
          </View>

          <View style={styles.profileInfo}>
            <View style={[styles.avatarContainer, { ...shadow.lg }]}>
              <View style={[styles.avatar, { backgroundColor: '#FFFFFF' }]}>
                <Text style={{ fontSize: 40 }}>👤</Text>
              </View>
              <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.secondary, ...shadow.sm }]}>
                <Icon name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={[typography.h2, { color: '#FFFFFF', marginTop: spacing.md }]}>{user?.name || 'User'}</Text>
            <Text style={[typography.bodySmall, { color: 'rgba(255,255,255,0.8)' }]}>{user?.phone}</Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: spacing.lg, marginTop: -spacing.xxl }}>
          {/* Account Settings */}
          <ThemedCard shadowSize="md" style={{ padding: 0 }}>
            <MenuTile
              icon="map-marker-outline"
              title="My Addresses"
              subtitle="Manage your delivery locations"
              onPress={() => navigation.navigate('AddressList')}
            />
            <MenuTile
              icon="history"
              title="My Orders"
              subtitle="View your past orders"
              onPress={() => navigation.navigate('OrdersTab', { screen: 'OrderList' })}
              isLast
            />
          </ThemedCard>

          {/* Logout */}
          <ThemedButton
            label="Logout"
            variant="danger"
            icon={<Icon name="logout" size={20} color="#FFFFFF" />}
            onPress={handleLogout}
            style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  menuTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
});
