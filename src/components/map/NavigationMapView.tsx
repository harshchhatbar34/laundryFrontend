// LaundroFlow — NavigationMapView Component
// Full-screen map with live location tracking, destination marker, route polyline,
// ETA/distance info bar, and "Start Navigation" button (opens Google Maps).

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { getDistanceKm } from '../../utils/helpers';
import {
  Coords,
  RouteInfo,
  getRoute,
  formatDistance,
  formatDuration,
  openGoogleMapsNavigation,
} from '../../utils/routing';

interface Props {
  destination: Coords;
  destinationLabel: string;
  destinationSubLabel?: string;
  onBack: () => void;
  isCustomer?: boolean;
}


export default function NavigationMapView({
  destination,
  destinationLabel,
  destinationSubLabel,
  onBack,
  isCustomer = false,
}: Props) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [userLocation, setUserLocation] = useState<Coords | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [routeLoading, setRouteLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Pulse animation for user dot — cleaned up on unmount
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.6, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  // Watch user's live location
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(true);
        setRouteLoading(false);
        return;
      }

      // Get initial position fast
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const initCoords: Coords = {
        latitude: initial.coords.latitude,
        longitude: initial.coords.longitude,
      };
      setUserLocation(initCoords);
      fetchRoute(initCoords);

      // Then watch for updates
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 15,
        },
        (loc) => {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  const fetchRoute = useCallback(
    async (origin: Coords) => {
      setRouteLoading(true);
      const result = await getRoute(origin, destination);
      setRouteInfo(result);
      setRouteLoading(false);
    },
    [destination]
  );

  // Effect 1: Center immediately on the shop once the map is ready (no waiting for GPS)
  useEffect(() => {
    if (mapReady) {
      if (__DEV__) console.log('[MapView] Map ready. Centering on destination:', destination);
      mapRef.current?.animateToRegion(
        {
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        500
      );
    }
  }, [mapReady, destination.latitude, destination.longitude]);

  // Failsafe: Animate to destination 800ms after mount to bypass any native onMapReady drops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (__DEV__) console.log('[MapView] Failsafe: animating to destination');
      mapRef.current?.animateToRegion(
        {
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        800
      );
    }, 800);
    return () => clearTimeout(timer);
  }, [destination.latitude, destination.longitude]);

  // Effect 2: Fit both coordinates ONLY if user GPS is loaded and they are close (< 50km)
  useEffect(() => {
    if (mapReady && userLocation) {
      const distance = getDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        destination.latitude,
        destination.longitude
      );

      if (__DEV__) console.log('[MapView] User GPS loaded. Distance:', distance.toFixed(1), 'km');

      if (distance < 50) {
        mapRef.current?.fitToCoordinates([userLocation, destination], {
          edgePadding: { top: 80, right: 60, bottom: 220, left: 60 },
          animated: true,
        });
      }
    }
  }, [mapReady, userLocation, destination.latitude, destination.longitude]);

  // Recenter on map markers
  const handleRecenter = () => {
    if (userLocation) {
      const distance = getDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        destination.latitude,
        destination.longitude
      );

      if (distance < 50) {
        mapRef.current?.fitToCoordinates([userLocation, destination], {
          edgePadding: { top: 80, right: 60, bottom: 220, left: 60 },
          animated: true,
        });
        return;
      }
    }

    // Default: animate straight to destination (the shop)
    mapRef.current?.animateToRegion(
      {
        latitude: destination.latitude,
        longitude: destination.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      1000
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* MAP */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation
        onMapReady={() => setMapReady(true)}
      >
        {/* Route polyline */}
        {routeInfo && routeInfo.polylineCoords.length > 0 && (
          <Polyline
            coordinates={routeInfo.polylineCoords}
            strokeColor={theme.colors.primary}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Real geographical Marker fixed to the spot */}
        <Marker
          coordinate={{
            latitude: destination.latitude,
            longitude: destination.longitude,
          }}
          title={destinationLabel}
          description={destinationSubLabel}
        >
          <View style={styles.markerContainer}>
            <View
              style={[
                styles.pinBubble,
                { backgroundColor: isCustomer ? '#10B981' : theme.colors.error },
              ]}
            >
              <Ionicons name={isCustomer ? 'person' : 'storefront'} size={18} color="#FFF" />
            </View>
            <View
              style={[
                styles.pinArrow,
                { borderTopColor: isCustomer ? '#10B981' : theme.colors.error },
              ]}
            />
          </View>
        </Marker>
      </MapView>

      {/* TOP HEADER BAR (Matching app/website design) */}
      <LinearGradient
        colors={(isDark ? [theme.colors.surface, theme.colors.surfaceElevated] : theme.gradients.ocean) as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.topBar, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={theme.hitSlop}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.topBarTitle}>
          <Text style={styles.destLabelText} numberOfLines={1}>
            {destinationLabel}
          </Text>
          {destinationSubLabel ? (
            <Text style={styles.destSubLabelText} numberOfLines={1}>
              {destinationSubLabel}
            </Text>
          ) : null}
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* RECENTER BUTTON */}
      <TouchableOpacity
        style={[styles.recenterBtn, { backgroundColor: theme.colors.surface }]}
        onPress={handleRecenter}
        activeOpacity={0.8}
      >
        <Ionicons name="navigate" size={22} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* BOTTOM INFO SHEET */}
      <View
        style={[
          styles.bottomSheet,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.borderLight,
            borderWidth: 1,
          },
        ]}
      >
        {locationError ? (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            ⚠️ Location permission denied. Enable location to see driving routes.
          </Text>
        ) : routeLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Calculating best route...
            </Text>
          </View>
        ) : routeInfo ? (
          <View style={styles.routeInfoRow}>
            <View style={styles.routeStat}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.routeStatValue, { color: theme.colors.textPrimary }]}>
                {formatDuration(routeInfo.durationSeconds)}
              </Text>
              <Text style={[styles.routeStatLabel, { color: theme.colors.textSecondary }]}>
                ETA
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.routeStat}>
              <Ionicons name="map-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.routeStatValue, { color: theme.colors.textPrimary }]}>
                {formatDistance(routeInfo.distanceMeters)}
              </Text>
              <Text style={[styles.routeStatLabel, { color: theme.colors.textSecondary }]}>
                Distance
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.noRouteText, { color: theme.colors.textSecondary }]}>
            Driving route not available. Use Google Maps below.
          </Text>
        )}

        {/* Start Navigation Button */}
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => openGoogleMapsNavigation(destination.latitude, destination.longitude)}
          activeOpacity={0.85}
        >
          <Ionicons name="navigate" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.navBtnText}>Start Navigation</Text>
          <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // Top header bar (Matching FreshWash standard layout)
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  topBarTitle: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  destLabelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  destSubLabelText: {
    fontSize: 12,
    marginTop: 2,
    color: 'rgba(255,255,255,0.85)',
  },

  // Recenter
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 220,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  // User location marker
  userMarkerContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: '#FFF',
  },

  // Destination marker
  destMarkerContainer: { alignItems: 'center' },
  destPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  destPinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },

  // Destination Marker Styles (rendered inside MapView)
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  pinBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pinArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: { marginLeft: 10, fontSize: 14 },
  errorText: { textAlign: 'center', marginBottom: 16, fontSize: 13, lineHeight: 20 },
  noRouteText: { textAlign: 'center', marginBottom: 16, fontSize: 13 },

  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  routeStat: { alignItems: 'center', flex: 1 },
  routeStatValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  routeStatLabel: { fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 48, marginHorizontal: 16 },

  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  navBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
