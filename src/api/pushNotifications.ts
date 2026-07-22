// FreshWash — Push Notification Registration & Token API

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, Alert } from 'react-native';
import api from './client';
import { USER_PUSH_TOKEN } from './endpoints';

const PROJECT_ID = '1f14223d-684e-4884-8cc1-c68d26590e30';

/**
 * Requests notification permissions and returns the push token.
 * - Tries native FCM device token first for standalone builds.
 * - Falls back to Expo Push Token if native FCM token fetch fails.
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  if (Platform.OS === 'android' && isExpoGo) {
    console.log('[Push] Skipping: remote push not supported in Expo Go on Android.');
    return null;
  }

  if (!Device.isDevice) {
    console.log('[Push] Skipping: not a physical device (simulator/emulator).');
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  console.log(`[Push] Current permission status: ${existingStatus}`);

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log(`[Push] Permission after request: ${finalStatus}`);
  }

  if (finalStatus !== 'granted') {
    console.warn(`[Push] Permission DENIED. Status: ${finalStatus}`);
    Alert.alert(
      'Notifications Disabled',
      'Please enable notifications in your phone Settings → Apps → LaundroFlow → Notifications.'
    );
    return null;
  }

  // Ensure Android notification channel exists
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'LaundroFlow',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
    console.log('[Push] Android notification channel "default" ensured.');
  }

  // Strategy 1: Attempt native device token (raw FCM for standalone Android APK)
  if (!isExpoGo) {
    try {
      console.log('[Push] Standalone build: Attempting getDevicePushTokenAsync (FCM)...');
      const tokenData = await Notifications.getDevicePushTokenAsync();
      if (tokenData?.data) {
        console.log(`[Push] ✅ Native FCM device token obtained (length=${tokenData.data.length})`);
        return tokenData.data;
      }
    } catch (e: any) {
      console.warn('[Push] getDevicePushTokenAsync failed, trying getExpoPushTokenAsync fallback:', e?.message || e);
    }
  }

  // Strategy 2: Attempt Expo Push Token (for Expo Go or fallback)
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId ||
      PROJECT_ID;
    console.log(`[Push] Attempting getExpoPushTokenAsync (projectId=${projectId})...`);
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    if (tokenData?.data) {
      console.log(`[Push] ✅ Expo push token obtained: ${tokenData.data}`);
      return tokenData.data;
    }
  } catch (e: any) {
    console.warn('[Push] ❌ getExpoPushTokenAsync fallback failed:', e?.message || e);
  }

  return null;
};

/**
 * Sends the push token to the backend to associate it with the logged-in user.
 */
export const savePushToken = async (token: string): Promise<void> => {
  try {
    console.log(`[Push] Saving token to backend (token=${token.substring(0, 25)}...)...`);
    const res = await api.patch(USER_PUSH_TOKEN, { pushToken: token }, {
      hideLoader: true,
      hideErrorToast: true,
    } as any);
    console.log('[Push] ✅ Token successfully saved to backend. Response status:', res?.status || 'OK');
  } catch (e: any) {
    console.error('[Push] ❌ Failed to save token to backend:', e?.message || e);
    if (e?.response) {
      console.error('[Push] Response error data:', JSON.stringify(e.response.data));
    }
  }
};
