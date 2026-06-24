import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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

export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const { theme } = useTheme();
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    Promise.all([
      dispatch(loadSavedTheme() as any),
      dispatch(loadUser() as any),
    ]).finally(() => setIsReady(true));
  }, [dispatch]);

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
    <NavigationContainer>
      {getNavigator()}
    </NavigationContainer>
  );
}
