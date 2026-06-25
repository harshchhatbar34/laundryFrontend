import React, { useEffect, useRef, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../store/slices/authSlice';
import { loadSavedTheme } from '../store/slices/themeSlice';
import { useTheme } from '../theme/ThemeContext';
import { USER_ROLES } from '../utils/constants';
import AuthStack from './AuthStack';
import CustomerTabs from './CustomerTabs';
import HelperStack from './HelperStack';
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
        return <HelperStack />;
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
