// LaundroFlow — Routing Utilities
// Provides OSRM route fetching, Nominatim geocoding, and Google Maps deep linking

import { Linking, Platform } from 'react-native';
import axios from 'axios';

export interface Coords {
  latitude: number;
  longitude: number;
}

export interface RouteInfo {
  polylineCoords: Coords[];
  distanceMeters: number;
  durationSeconds: number;
}

/**
 * Fetches a driving route from OSRM (free, no API key required).
 */
export async function getRoute(origin: Coords, destination: Coords): Promise<RouteInfo | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}` +
      `?overview=full&geometries=geojson`;

    const res = await axios.get(url, { timeout: 12000 });
    const route = res.data?.routes?.[0];
    if (!route) return null;

    const polylineCoords: Coords[] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng })
    );

    return {
      polylineCoords,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    };
  } catch (e) {
    if (__DEV__) console.warn('[Routing] OSRM route fetch failed:', e);
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<Coords | null> {
  try {
    let lat: number | null = null;
    let lng: number | null = null;

    // 1. Try Google Geocoding API if key is available
    const googleKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (googleKey) {
      try {
        if (__DEV__) console.log('[Geocoding Routing] Trying Google Geocoding...');
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleKey}`;
        const res = await axios.get(googleUrl, { timeout: 8000 });
        const resData = res.data;
        if (resData && resData.status === 'OK' && resData.results && resData.results.length > 0) {
          const loc = resData.results[0].geometry.location;
          lat = loc.lat;
          lng = loc.lng;
          if (__DEV__) console.log(`[Geocoding Routing SUCCESS] Google matched: ${lat}, ${lng}`);
        }
      } catch (err) {
        if (__DEV__) console.log('[Geocoding Routing] Google Geocoding failed, falling back to OSM:', err);
      }
    }

    // 2. Fallback to OpenStreetMap Nominatim loop if Google failed/disabled
    if (lat === null || lng === null) {
      // Determine fallbacks
      const queryOptions = [address];
      
      // Try to extract a 6-digit Indian pincode from the address string
      const pinMatch = address.match(/\b\d{6}\b/);
      if (pinMatch) {
        queryOptions.push(`${pinMatch[0].trim()}, India`);
      }

      // Try to get city, state (usually the parts before 'India' / the postcode)
      const parts = address.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 2) {
        const cityIndex = parts.length - 4; // index of City if parts is [line1, line2, city, state, pin, India]
        if (cityIndex >= 0) {
          const fallbackRegion = [parts[cityIndex], parts[cityIndex + 1], 'India'].join(', ');
          queryOptions.push(fallbackRegion);
        }
      }

      for (const q of queryOptions) {
        try {
          if (__DEV__) console.log(`[Geocoding Routing] Querying Nominatim: ${q}`);
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=in`;
          const res = await axios.get(url, {
            headers: { 'User-Agent': 'LaundroFlow-App/1.0' },
            timeout: 10000,
          });
          const result = res.data?.[0];
          if (result) {
            lat = parseFloat(result.lat);
            lng = parseFloat(result.lon);
            if (__DEV__) console.log(`[Geocoding Routing SUCCESS] Nominatim matched: ${lat}, ${lng}`);
            break;
          }
        } catch (err) {
          if (__DEV__) console.log(`[Geocoding Routing] Nominatim query failed for '${q}':`, err);
        }
      }
    }

    if (lat !== null && lng !== null) {
      return { latitude: lat, longitude: lng };
    }
    return null;
  } catch (e) {
    if (__DEV__) console.warn('[Routing] Nominatim geocoding failed:', e);
    return null;
  }
}

/**
 * Builds a single address string from an address object for geocoding.
 */
export function buildAddressString(address: {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}): string {
  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.pincode,
    'India',
  ]
    .filter(Boolean)
    .join(', ');
}

/** Formats meters to a human-readable distance string. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Formats seconds to a human-readable duration string. */
export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

/**
 * Opens Google Maps (or Apple Maps on iOS) with turn-by-turn navigation to the destination.
 */
export function openGoogleMapsNavigation(destLat: number, destLng: number): void {
  // Use the universal maps URL. Android and iOS will automatically open this
  // directly in the native Google Maps app, which is 100% reliable.
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
  const appleMaps = `maps://app?daddr=${destLat},${destLng}`;

  if (Platform.OS === 'ios') {
    const googleIOS = `comgooglemaps://?daddr=${destLat},${destLng}&directionsmode=driving`;
    Linking.canOpenURL(googleIOS).then((supported) => {
      Linking.openURL(supported ? googleIOS : appleMaps);
    });
  } else {
    Linking.openURL(googleMapsUrl).catch((err) => {
      if (__DEV__) console.warn('[Routing] Failed to open maps URL:', err);
    });
  }
}
