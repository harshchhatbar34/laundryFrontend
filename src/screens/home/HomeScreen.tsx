import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, ScrollView, Alert, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import * as Location from 'expo-location';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Card from '../../components/ui/Card';
import { useTheme } from '../../theme/ThemeContext';
import { getNearestBranch } from '../../api/branches';
import { getServices, getMasters } from '../../api/services';
import { getGreeting } from '../../utils/helpers';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/CustomerTabs';
import { RootState } from '../../store';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useSelector((s: RootState) => s.auth);
  const [branches, setBranches] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [masters, setMasters] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
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

  const openDirections = (b: any) => {
    const lat = b.location?.coordinates?.[1];
    const lng = b.location?.coordinates?.[0];
    const label = encodeURIComponent(b.name || 'Laundry Branch');
    const address = encodeURIComponent(`${b.addressLine}, ${b.city}`);

    let url = '';
    if (lat && lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}&travelmode=driving`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) return Linking.openURL(url);
        const geoUrl = lat && lng ? `geo:${lat},${lng}?q=${lat},${lng}(${label})` : `geo:0,0?q=${address}`;
        return Linking.openURL(geoUrl);
      })
      .catch((err) => console.log('Error opening maps:', err));
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
        setBranches(branchRes.data.branches || (branchRes.data.branch ? [branchRes.data.branch] : []));
      }
      if (servicesRes?.data?.services) setServices(servicesRes.data.services);
      if (mastersRes?.data) setMasters(mastersRes.data);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Header */}
        <View style={[styles.greetingRow, { paddingHorizontal: 20 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, fontWeight: '500' }]}>
              {getGreeting()}
            </Text>
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, fontWeight: '800' }]}>
              {user?.name || 'Guest'} 👋
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.bellBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* 2026 Theme Hero Express Banner Card */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <LinearGradient
            colors={theme.gradients.ocean as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroEmblem}>
                <Ionicons name="shirt-outline" size={26} color="#C9A227" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.heroTitle}>LaundroFlow Express</Text>
                <Text style={styles.heroSubtitle}>
                  Delicious clean & fresh laundry prepared with care and delivered fast. Select a branch outlet below to order online.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Laundry Branches Section */}
        {branches.length > 0 && (
          <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 14, fontWeight: '800' }]}>
              Laundry Branches
            </Text>
            {branches.map((b) => {
              const distanceStr = formatDistance(
                userLocation.latitude,
                userLocation.longitude,
                b.location.coordinates[1],
                b.location.coordinates[0]
              );
              return (
                <Card
                  key={b._id}
                  style={styles.branchListItem}
                  padding="medium"
                  onPress={() => navigation.navigate('BranchCatalog', { branch: b, masters: { ...masters, services } })}
                >
                  <View style={styles.branchRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, fontWeight: '700' }]} numberOfLines={1}>
                        {b.name}
                      </Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
                        {b.addressLine}, {b.city}
                      </Text>
                    </View>
                    <View style={styles.branchRightCol}>
                      <View style={styles.liveStatus}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={[theme.typography.labelSmall, { color: theme.colors.textPrimary, fontWeight: '600', marginLeft: 3 }]}>
                          {distanceStr}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => openDirections(b)}
                        style={[styles.directionsBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="navigate-sharp" size={12} color={theme.colors.textPrimary} />
                        <Text style={[styles.directionsBtnText, { color: theme.colors.textPrimary }]}>Navigate</Text>
                      </TouchableOpacity>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} style={{ marginLeft: 4 }} />
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
  branchRow: { flexDirection: 'row', alignItems: 'center' },
  liveStatus: { flexDirection: 'row', alignItems: 'center' },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#0B1E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  heroContent: { flexDirection: 'row', alignItems: 'center' },
  heroEmblem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: '#C9A227',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 19, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginTop: 4, lineHeight: 18 },
  branchListItem: { marginBottom: 12, borderRadius: 20 },
  branchRightCol: { flexDirection: 'row', alignItems: 'center' },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 10,
  },
  directionsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});
