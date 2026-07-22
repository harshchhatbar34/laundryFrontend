// LaundroFlow — DeliveryNavigationScreen
// Geocodes a customer's text delivery address via Nominatim, then shows a navigation map.
// Used by Helpers and Owners from order detail screens.

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import NavigationMapView from '../../components/map/NavigationMapView';
import { geocodeAddress, buildAddressString, Coords } from '../../utils/routing';

interface DeliveryNavigationParams {
  address: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    label?: string;
  };
  customerName?: string;
  orderNumber?: string;
}

interface Props {
  route: { params: DeliveryNavigationParams };
  navigation: any;
}

export default function DeliveryNavigationScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { address, customerName, orderNumber } = route.params;

  const [destCoords, setDestCoords] = useState<Coords | null>(null);
  const [geocoding, setGeocoding] = useState(true);
  const [geocodeError, setGeocodeError] = useState(false);

  useEffect(() => {
    const runGeocode = async () => {
      setGeocoding(true);
      setGeocodeError(false);

      // Check if coordinates already exist in the passed address object
      const addrWithLoc = address as any;
      if (addrWithLoc?.location?.coordinates && Array.isArray(addrWithLoc.location.coordinates)) {
        const [lng, lat] = addrWithLoc.location.coordinates;
        // Verify it is not the default placeholder (Ahmedabad coordinates 72.5714, 23.0225)
        const isDefault = Math.abs(lng - 72.5714) < 0.001 && Math.abs(lat - 23.0225) < 0.001;
        if (!isDefault && lat && lng) {
          if (__DEV__) console.log(`[Delivery Nav] Using pre-saved coordinates: ${lat}, ${lng}`);
          setDestCoords({
            latitude: Number(lat),
            longitude: Number(lng),
          });
          setGeocoding(false);
          return;
        }
      }

      const addressStr = buildAddressString(address);
      const coords = await geocodeAddress(addressStr);

      if (coords) {
        setDestCoords({
          latitude: Number(coords.latitude),
          longitude: Number(coords.longitude),
        });
      } else {
        setGeocodeError(true);
      }
      setGeocoding(false);
    };

    runGeocode();
  }, []);

  // Build readable labels
  const destLabel = customerName || address.label || 'Customer';
  const destSubLabel = [address.addressLine1, address.city].filter(Boolean).join(', ');

  // Loading state while geocoding
  if (geocoding) {
    return (
      <View style={[styles.centerScreen, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.backBtnOverlay, { top: insets.top + 12 }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.geocodingText, { color: theme.colors.textPrimary }]}>
          Finding address on map...
        </Text>
        <Text style={[styles.geocodingSubText, { color: theme.colors.textSecondary }]}>
          {buildAddressString(address)}
        </Text>
      </View>
    );
  }

  // Error state if geocoding failed
  if (geocodeError || !destCoords) {
    return (
      <View style={[styles.centerScreen, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.backBtnOverlay, { top: insets.top + 12 }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Ionicons name="alert-circle-outline" size={56} color={theme.colors.error} />
        <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
          Address Not Found
        </Text>
        <Text style={[styles.errorSubText, { color: theme.colors.textSecondary }]}>
          Could not locate this address on the map:
        </Text>
        <Text style={[styles.errorAddress, { color: theme.colors.textSecondary }]}>
          {buildAddressString(address)}
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setGeocodeError(false);
            setGeocoding(true);
            geocodeAddress(buildAddressString(address)).then((coords) => {
              if (coords) setDestCoords(coords);
              else setGeocodeError(true);
              setGeocoding(false);
            });
          }}
        >
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationMapView
      destination={destCoords}
      destinationLabel={destLabel}
      destinationSubLabel={destSubLabel}
      onBack={() => navigation.goBack()}
      isCustomer
    />
  );
}

const styles = StyleSheet.create({
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  backBtnOverlay: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  geocodingText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  geocodingSubText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  errorAddress: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
