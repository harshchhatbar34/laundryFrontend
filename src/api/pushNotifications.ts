// FreshWash — Push Notification Registration & Token API

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
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
    console.log('[Push] Permission denied');
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'b682f2bd-393e-433a-a6f0-d46bd98297b0',
    });
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
  } catch (e) {
    console.warn('[Push] Failed to get push token:', e);
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
  } catch (e) {
    console.warn('[Push] Failed to save token to backend (non-critical):', e);
  }
};
