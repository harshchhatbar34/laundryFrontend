import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, ScrollView, Alert, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import * as Location from 'expo-location';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import FadeSlideIn from '../../animations/FadeSlideIn';
import PulseGlow from '../../animations/PulseGlow';
import { useTheme } from '../../theme/ThemeContext';
import { getNearestBranch } from '../../api/branches';
import { getServices, getMasters } from '../../api/services';
import { getGreeting } from '../../utils/helpers';
import { SERVICE_ICONS } from '../../utils/constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/CustomerTabs';
import { RootState } from '../../store';


type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useSelector((s: RootState) => s.auth);
  const [branch, setBranch] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [masters, setMasters] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({ latitude: 23.0225, longitude: 72.5714 });

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dist = getDistanceKm(lat1, lon1, lat2, lon2);
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m`;
    }
    return `${dist.toFixed(1)}km`;
  };

  /**
   * Opens Google Maps (Android) or Apple Maps (iOS) with turn-by-turn directions
   * to the branch. Falls back to address search if no coordinates available.
   */
  const openDirections = (b: any) => {
    const lat = b.location?.coordinates?.[1];
    const lng = b.location?.coordinates?.[0];
    const label = encodeURIComponent(b.name || 'Laundry Branch');
    const address = encodeURIComponent(`${b.addressLine}, ${b.city}`);

    let url = '';
    if (lat && lng) {
      // Google Maps deep link — works on both Android and iOS
      // Android: opens Google Maps app; iOS: opens Google Maps if installed, else Apple Maps
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}&travelmode=driving`;
    } else {
      // Fallback: search by address
      url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        }
        // Fallback to geo URI for native maps app
        const geoUrl = lat && lng
          ? `geo:${lat},${lng}?q=${lat},${lng}(${label})`
          : `geo:0,0?q=${address}`;
        return Linking.openURL(geoUrl);
      })
      .catch((err) => console.log('Error opening maps:', err));
  };

  const handleBranchPress = (b: any) => {
    Alert.alert(
      b.name,
      `Address: ${b.addressLine}\n${b.landmark ? `Landmark: ${b.landmark}\n` : ''}City: ${b.city}\nPhone: ${b.phone || 'N/A'}`,
      [
        {
          text: '🗺️ Get Directions',
          onPress: () => openDirections(b),
        },
        ...(b.phone
          ? [
              {
                text: '📞 Call Branch',
                onPress: () => {
                  Linking.openURL(`tel:${b.phone}`).catch((err) =>
                    console.log('Error opening dialer:', err)
                  );
                },
              },
            ]
          : []),
        {
          text: 'Close',
          style: 'cancel' as const,
        },
      ]
    );
  };

  const fetchData = useCallback(async () => {
    try {
      let lat = 23.0225;
      let lng = 72.5714;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getLastKnownPositionAsync({});
          if (!loc) {
            loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          }
          if (loc) {
            lat = loc.coords.latitude;
            lng = loc.coords.longitude;
            setUserLocation({ latitude: lat, longitude: lng });
          }
        }
      } catch (err) {
        console.log('Error getting location:', err);
      }

      const [branchRes, servicesRes, mastersRes] = await Promise.all([
        getNearestBranch(lat, lng).catch(() => null),
        getServices().catch(() => null),
        getMasters().catch(() => null),
      ]);
      if (branchRes?.data) {
        setBranch(branchRes.data.branch || null);
        setBranches(branchRes.data.branches || (branchRes.data.branch ? [branchRes.data.branch] : []));
      }
      if (servicesRes?.data?.services) setServices(servicesRes.data.services);
      if (mastersRes?.data) setMasters(mastersRes.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={[styles.greetingRow, { paddingHorizontal: 20 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>{getGreeting()}</Text>
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{user?.name || 'Guest'} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}
            style={[styles.bellBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Premium Hero Welcome Banner */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <LinearGradient
            colors={theme.gradients.ocean as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroEmoji}>🧺</Text>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.heroTitle}>FreshWash Premium Care</Text>
                <Text style={styles.heroSubtitle}>
                  Professional laundry, ironing & dry cleaning. Choose a branch below to view services and place your order.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Branches Selection List */}
        {branches.length > 0 && (
          <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 12 }]}>
              Our Branches
            </Text>
            {branches.map((b) => {
              const distanceStr = formatDistance(userLocation.latitude, userLocation.longitude, b.location.coordinates[1], b.location.coordinates[0]);
              return (
                <Card
                  key={b._id}
                  style={styles.branchListItem}
                  padding="medium"
                  onPress={() => navigation.navigate('BranchCatalog', { branch: b, masters: { ...masters, services } })}
                >
                  <View style={styles.branchRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[theme.typography.h4, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {b.name}
                      </Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
                        {b.addressLine}, {b.city}
                      </Text>
                    </View>
                    <View style={styles.branchRightCol}>
                      <View style={styles.liveStatus}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.primary} />
                        <Text style={[theme.typography.labelSmall, { color: theme.colors.primary, marginLeft: 4 }]}>
                          {distanceStr}
                        </Text>
                      </View>
                      {/* Get Directions button */}
                      <TouchableOpacity
                        onPress={() => openDirections(b)}
                        style={[styles.directionsBtn, { backgroundColor: theme.colors.primary + '18' }]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="navigate" size={14} color={theme.colors.primary} />
                        <Text style={[styles.directionsBtnText, { color: theme.colors.primary }]}>Navigate</Text>
                      </TouchableOpacity>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} style={{ marginLeft: 6 }} />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  greetingRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 16 },
  bellBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  branchRow: { flexDirection: 'row', alignItems: 'flex-start' },
  liveStatus: { flexDirection: 'row', alignItems: 'center' },
  closedBanner: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12 },
  heroCard: { borderRadius: 16, padding: 18, overflow: 'hidden' },
  heroContent: { flexDirection: 'row', alignItems: 'center' },
  heroEmoji: { fontSize: 32 },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  heroSubtitle: { fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginTop: 4, lineHeight: 18 },
  branchListItem: { marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent' },
  branchRightCol: { flexDirection: 'row', alignItems: 'center' },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  directionsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
});
