import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import { loadUser } from '../store/authSlice';
import { loadSavedTheme } from '../store/themeSlice';
import { useTheme } from '../theme/ThemeProvider';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import DriverNavigator from './DriverNavigator';

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const { theme } = useTheme();
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    Promise.all([
      dispatch(loadSavedTheme()),
      dispatch(loadUser()),
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
    if (!isLoggedIn) return <AuthNavigator />;
    if (user?.role === 'driver') return <DriverNavigator />;
    return <TabNavigator />;
  };

  return (
    <NavigationContainer>
      {getNavigator()}
    </NavigationContainer>
  );
}
