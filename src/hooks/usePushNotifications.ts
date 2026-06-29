// FreshWash — usePushNotifications hook
// Registers the device for push notifications on login,
// saves the token to backend, and listens for incoming notifications.

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { registerForPushNotifications, savePushToken } from '../api/pushNotifications';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface Options {
  onNotificationTap?: (notification: Notifications.Notification) => void;
}

export function usePushNotifications({ onNotificationTap }: Options = {}) {
  const { isLoggedIn } = useSelector((s: RootState) => s.auth);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Register and save token
    registerForPushNotifications().then((token) => {
      if (token) savePushToken(token);
    });

    // Foreground notification received
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Push] Received in foreground:', notification.request.content.title);
      }
    );

    // User tapped on notification (background / killed state)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[Push] Tapped:', response.notification.request.content);
        onNotificationTap?.(response.notification);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isLoggedIn]);
}
