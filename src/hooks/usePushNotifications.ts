// FreshWash — usePushNotifications hook
// Registers the device for push notifications on login,
// saves the token to backend, and listens for incoming notifications.

import { useEffect, useRef } from 'react';
import type * as Notifications from 'expo-notifications';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { registerForPushNotifications, savePushToken } from '../api/pushNotifications';
import { isRunningInExpoGo } from 'expo';

// Configure how notifications are displayed when app is in foreground (standalone builds only)
if (!isRunningInExpoGo()) {
  try {
    const NotificationsMod = require('expo-notifications');
    NotificationsMod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    if (__DEV__) console.warn('[Notifications] setNotificationHandler skipped:', e);
  }
}

interface Options {
  onNotificationTap?: (notification: Notifications.Notification) => void;
}

export function usePushNotifications({ onNotificationTap }: Options = {}) {
  const { isLoggedIn } = useSelector((s: RootState) => s.auth);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!isLoggedIn || isRunningInExpoGo()) return;

    // Register and save token
    registerForPushNotifications()
      .then((token) => {
        if (token) savePushToken(token);
      })
      .catch((err) => {
        console.warn('[Push] Error in usePushNotifications:', err);
      });

    // Foreground notification received
    try {
      const NotificationsMod = require('expo-notifications');
      notificationListener.current = NotificationsMod.addNotificationReceivedListener(
        (notification: any) => {
          console.log('[Push] Received in foreground:', notification.request.content.title);
        }
      );
    } catch {}

    // User tapped on notification (background / killed state)
    try {
      const NotificationsMod = require('expo-notifications');
      responseListener.current = NotificationsMod.addNotificationResponseReceivedListener(
        (response: any) => {
          console.log('[Push] Tapped:', response.notification.request.content);
          onNotificationTap?.(response.notification);
        }
      );
    } catch {}

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isLoggedIn, onNotificationTap]);
}
