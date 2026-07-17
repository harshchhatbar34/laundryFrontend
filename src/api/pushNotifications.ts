// FreshWash — Push Notification Registration & Token API

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, Alert } from 'react-native';
import api from './client';
import { USER_PUSH_TOKEN } from './endpoints';

/**
 * Requests notification permissions and returns the Expo push token.
 * Returns null if permissions are denied or device is not physical.
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  // Check if we are running in Expo Go on Android
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  if (Platform.OS === 'android' && isExpoGo) {
    console.log('[Push] Skipping registration: remote push notifications are not supported in Expo Go on Android. Use a dev build instead.');
    return null;
  }

  if (!Device.isDevice) {
    console.log('[Push] Skipping: not a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Push Permission Denied', `Notification permission is not granted. Status: ${finalStatus}`);
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId || '1f14223d-684e-4884-8cc1-c68d26590e30';
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;
    console.log('[Push] Expo push token:', token);

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'LaundroFlow',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
        sound: 'default',
      });
    }

    return token;
  } catch (e: any) {
    console.warn('[Push] Failed to get push token:', e);
    Alert.alert('Push Token Fetch Error', e?.message || String(e));
    return null;
  }
};

/**
 * Sends the push token to the backend to associate it with the logged-in user.
 */
export const savePushToken = async (token: string): Promise<void> => {
  try {
    // hideLoader + hideErrorToast: this is a silent background call
    // 404 means backend doesn't have the endpoint yet — fail gracefully
    await api.patch(USER_PUSH_TOKEN, { pushToken: token }, {
      hideLoader: true,
      hideErrorToast: true,
    } as any);
    console.log('[Push] Token saved to backend');
  } catch (e: any) {
    console.warn('[Push] Failed to save token to backend (non-critical):', e);
    Alert.alert('Push Token Save Error', e?.message || String(e));
  }
};
