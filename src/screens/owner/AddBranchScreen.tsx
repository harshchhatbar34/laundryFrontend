import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/uiSlice';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StateDropdown from '../../components/ui/StateDropdown';
import CityDropdown from '../../components/ui/CityDropdown';
import { useTheme } from '../../theme/ThemeContext';
import { createBranch } from '../../api/owner';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerBranchStackParamList } from '../../navigation/OwnerTabs';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<OwnerBranchStackParamList, 'AddBranch'>;

export default function AddBranchScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const mapRef = useRef<MapView>(null);
  const geocodeTimeoutRef = useRef<any>(null);
  
  const [form, setForm] = useState({ name: '', addressLine: '', landmark: '', city: '', phone: '', lat: '23.0225', lng: '72.5714' });
  const [selectedState, setSelectedState] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Helper function to fetch address and city from coordinates (Reverse Geocoding)
  const handleReverseGeocode = async (latitude: number, longitude: number) => {
    if (latitude === 0 && longitude === 0) return;
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'FreshWashApp/1.0'
        }
      });
      const data = await res.json();
      
      let addressLine = '';
      let city = '';
      
      if (data && !data.error) {
        const addr = data.address || {};
        
        // Build a readable address line (e.g. Road, Suburb, Town/Village)
        const road = addr.road || addr.pedestrian || '';
        const suburb = addr.suburb || addr.neighbourhood || '';
        const town = addr.town || addr.village || '';
        const addressParts = [road, suburb, town].filter(Boolean);
        
        addressLine = addressParts.join(', ');
        if (!addressLine && data.display_name) {
          addressLine = data.display_name.split(',').slice(0, 3).join(',').trim();
        }
        
        // Prioritize state_district (e.g. Ahmedabad) over town (e.g. Sarkhej) to get the correct major city name
        city = addr.city || addr.state_district || addr.town || addr.municipality || addr.county || '';
      }
      
      // ALWAYS update form coordinates and details, preserving old values if new ones are empty
      setForm(p => ({
        ...p,
        addressLine: addressLine || p.addressLine,
        city: city || p.city,
        lat: String(latitude),
        lng: String(longitude)
      }));
    } catch (err) {
      console.log('Reverse geocoding failed:', err);
      // Fallback: still update coordinates so the pin location is saved
      setForm(p => ({
        ...p,
        lat: String(latitude),
        lng: String(longitude)
      }));
    } finally {
      setGeocoding(false);
    }
  };

  // Get owner's current location on mount to center the map near them
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getLastKnownPositionAsync({});
          if (!loc) {
            loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          }
          if (loc) {
            const { latitude, longitude } = loc.coords;
            setForm(p => ({ ...p, lat: String(latitude), lng: String(longitude) }));
            mapRef.current?.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 500);
            
            // Auto-fill address for their current location
            handleReverseGeocode(latitude, longitude);
          }
        }
      } catch (err) {
        console.log('Error getting initial location:', err);
      }
    })();

    // Cleanup timeout on unmount
    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchAddress = async () => {
    if (!form.addressLine.trim() || !form.city.trim()) {
      dispatch(showToast({ type: 'warning', message: 'Enter address and city first' }));
      return;
    }
    setSearching(true);
    try {
      const query = `${form.addressLine}, ${form.city}`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'FreshWashApp/1.0'
        }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setForm(p => ({ ...p, lat: String(newLat), lng: String(newLng) }));
        dispatch(showToast({ type: 'success', message: 'Location found and pinned!' }));
        mapRef.current?.animateToRegion({
          latitude: newLat,
          longitude: newLng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      } else {
        dispatch(showToast({ type: 'warning', message: 'Address not found on map. Pan map manually.' }));
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: 'Failed to search address' }));
    } finally {
      setSearching(false);
    }
  };

  const handleUseGPS = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        dispatch(showToast({ type: 'warning', message: 'Location permission denied' }));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      setForm(p => ({ ...p, lat: String(latitude), lng: String(longitude) }));
      dispatch(showToast({ type: 'success', message: 'Pinned to your current GPS!' }));
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
      
      // Auto-geocode the GPS coordinates
      handleReverseGeocode(latitude, longitude);
    } catch (err) {
      dispatch(showToast({ type: 'error', message: 'Failed to get current GPS location' }));
    } finally {
      setLocating(false);
    }
  };

  // Called when the map panning stops — updates the selected coordinates and geocodes
  const handleRegionChangeComplete = (region: any) => {
    // 1. Update the coordinates in state instantly so the user sees the numbers change
    setForm(p => ({ ...p, lat: String(region.latitude), lng: String(region.longitude) }));
    
    // 2. Clear any pending geocoding timeout
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }
    
    // 3. Set a new timeout to execute the reverse geocoding after 1000ms of inactivity (Debounce rate-limit)
    geocodeTimeoutRef.current = setTimeout(() => {
      handleReverseGeocode(region.latitude, region.longitude);
    }, 1000);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim()) {
      dispatch(showToast({ type: 'warning', message: 'Name and city are required' }));
      return;
    }
    setLoading(true);
    try {
      await createBranch({
        name: form.name,
        addressLine: form.addressLine,
        landmark: form.landmark,
        city: form.city,
        phone: form.phone,
        location: { coordinates: [parseFloat(form.lng) || 72.5714, parseFloat(form.lat) || 23.0225] }
      });
      navigation.goBack();
    } catch (e) {
      dispatch(showToast({ type: 'error', message: 'Failed to create branch' }));
    } finally {
      setLoading(false);
    }
  };

  const currentLat = parseFloat(form.lat) || 23.0225;
  const currentLng = parseFloat(form.lng) || 72.5714;

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Add Branch" showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <Input label="Branch Name" value={form.name} onChangeText={(v) => set('name', v)} icon="storefront-outline" />
          <Input label="Address" value={form.addressLine} onChangeText={(v) => set('addressLine', v)} icon="location-outline" />
          <Input label="Landmark" value={form.landmark} onChangeText={(v) => set('landmark', v)} icon="flag-outline" />
          <StateDropdown
            label="State"
            selectedState={selectedState}
            onSelect={(selected) => {
              setSelectedState(selected);
              set('city', '');
            }}
          />
          <CityDropdown
            label="City"
            selectedState={selectedState}
            selectedCity={form.city}
            onSelect={(selected) => set('city', selected)}
          />
          <Input label="Phone" value={form.phone} onChangeText={(v) => set('phone', v)} icon="call-outline" keyboardType="phone-pad" />
          
          <Text style={[theme.typography.h4, { color: theme.colors.textPrimary, marginTop: 16, marginBottom: 8 }]}>
            📍 Shop Location on Map
          </Text>
          
          {/* Map Wrapper with fixed center pin */}
          <View style={[styles.mapWrapper, { borderColor: theme.colors.border }]}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: currentLat,
                longitude: currentLng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onRegionChangeComplete={handleRegionChangeComplete}
            />
            
            {/* Fixed center pin representing the shop */}
            <View style={styles.centerPinContainer} pointerEvents="none">
              <View style={styles.customPin}>
                <View style={[styles.pinBubble, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="storefront" size={18} color="#FFF" />
                </View>
                <View style={[styles.pinArrow, { borderTopColor: theme.colors.primary }]} />
              </View>
            </View>
          </View>

          <View style={[styles.coordBanner, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
            {geocoding ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="location" size={16} color={theme.colors.primary} />
            )}
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 6, flex: 1 }]}>
              {geocoding 
                ? "Updating address from map pin..." 
                : `Pinned: ${currentLat.toFixed(5)}, ${currentLng.toFixed(5)} (Drag map to adjust shop location)`
              }
            </Text>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity 
              onPress={handleSearchAddress} 
              disabled={searching}
              style={[styles.mapActionBtn, { borderColor: theme.colors.primary, borderWidth: 1 }]}
            >
              {searching ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <Ionicons name="search-outline" size={16} color={theme.colors.primary} />
                  <Text style={[theme.typography.labelSmall, { color: theme.colors.primary, marginLeft: 6 }]}>
                    Find Address
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleUseGPS} 
              disabled={locating}
              style={[styles.mapActionBtn, { backgroundColor: theme.colors.primary }]}
            >
              {locating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="locate-outline" size={16} color="#FFF" />
                  <Text style={[theme.typography.labelSmall, { color: '#FFF', marginLeft: 6 }]}>
                    Pin My GPS
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Button title="Create Branch" onPress={handleSave} loading={loading} icon="checkmark-outline" style={{ marginTop: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mapWrapper: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 4,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  coordBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  mapActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPinContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  customPin: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -18 }], // Mathematically offsets pin so the bottom arrow tip points exactly at the map center
  },
  pinBubble: {
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
