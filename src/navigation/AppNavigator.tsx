import React, { useEffect, useRef, useCallback } from 'react';
import { View, ActivityIndicator, Linking } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../store/slices/authSlice';
import { loadSavedTheme } from '../store/slices/themeSlice';
import { useTheme } from '../theme/ThemeContext';
import { USER_ROLES } from '../utils/constants';
import AuthStack from './AuthStack';
import CustomerTabs from './CustomerTabs';
import HelperTabs from './HelperTabs';
import OwnerTabs from './OwnerTabs';
import AdminTabs from './AdminTabs';
import { AppDispatch, RootState } from '../store';
import { usePushNotifications } from '../hooks/usePushNotifications';
import * as Notifications from 'expo-notifications';

export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const { theme } = useTheme();
  const [isReady, setIsReady] = React.useState(false);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    Promise.all([
      dispatch(loadSavedTheme() as any),
      dispatch(loadUser() as any),
    ]).finally(() => setIsReady(true));
  }, [dispatch]);

  // Handle deep links — laundroflow://register?code=XXXX or laundroflow://set-password?token=XXXX
  const handleDeepLink = useCallback((url: string | null) => {
    if (!url) return;
    try {
      const queryString = url.includes('?') ? url.split('?')[1] : '';
      const params = new URLSearchParams(queryString);
      const code = params.get('code');
      const token = params.get('token');
      const path = url.replace(/^[a-zA-Z0-9+\-.]+:\/\//, '').split('?')[0];

      if ((path === 'register' || path.endsWith('/register')) && code && navigationRef.current) {
        // If not logged in, navigate to Register with code
        navigationRef.current.navigate('Register' as never, { tenantCode: code } as never);
      } else if ((path === 'set-password' || path === 'reset-password' || path.endsWith('/set-password') || path.endsWith('/reset-password')) && token && navigationRef.current) {
        // Navigate to SetPassword screen with reset token
        navigationRef.current.navigate('SetPassword' as never, { token } as never);
      }
    } catch (e) {
      if (__DEV__) console.warn('Error parsing deep link:', e);
    }
  }, []);

  useEffect(() => {
    // Handle link that opened the app from cold start
    Linking.getInitialURL().then((url) => { if (url) handleDeepLink(url); });
    // Handle links while app is open
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => sub.remove();
  }, [handleDeepLink]);

  // Handle notification taps — navigate to the right order detail screen
  const handleNotificationTap = useCallback((notification: Notifications.Notification) => {
    const data = notification.request.content.data as any;
    if (!navigationRef.current || !data) return;

    const orderId = data.orderId;
    if (!orderId) return;

    // Navigate based on the logged-in user's role
    if (user?.role === USER_ROLES.CUSTOMER) {
      navigationRef.current.navigate('Orders', { screen: 'OrderDetail', params: { orderId } });
    } else if (user?.role === USER_ROLES.OWNER) {
      navigationRef.current.navigate('Orders', { screen: 'OwnerOrderDetail', params: { orderId } });
    } else if (user?.role === USER_ROLES.HELPER) {
      navigationRef.current.navigate('HelperOrderDetail', { orderId });
    }
  }, [user?.role]);

  // Register for push notifications and set up listeners
  usePushNotifications({ onNotificationTap: handleNotificationTap });

  // Handle notification that launched the app from killed state
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification) {
        // Slight delay to let the navigator mount
        setTimeout(() => handleNotificationTap(response.notification), 1000);
      }
    });
  }, [isLoggedIn]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const getNavigator = () => {
    if (!isLoggedIn) return <AuthStack />;

    switch (user?.role) {
      case USER_ROLES.HELPER:
        return <HelperTabs />;
      case USER_ROLES.OWNER:
        return <OwnerTabs />;
      case USER_ROLES.SUPERADMIN:
        return <AdminTabs />;
      case USER_ROLES.CUSTOMER:
      default:
        return <CustomerTabs />;
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      {getNavigator()}
    </NavigationContainer>
  );
}
