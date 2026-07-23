import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HelperDashboardScreen from '../screens/helper/HelperDashboardScreen';
import HelperOrderDetailScreen from '../screens/helper/HelperOrderDetailScreen';
import HelperReportScreen from '../screens/helper/HelperReportScreen';
import HelperProfileScreen from '../screens/profile/HelperProfileScreen';

export type HelperStackParamList = {
  HelperTabsMain: undefined;
  HelperDashboard: undefined;
  HelperOrderDetail: { orderId: string };
  HelperReport: undefined;
  Profile: undefined;
};

export type HelperTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<HelperTabParamList>();
const Stack = createNativeStackNavigator<HelperStackParamList>();

import { AnimatedTabBarItem } from '../components/ui/AnimatedTabBarItem';

function HelperTabNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme.mode === 'dark';

  const getTabConfig = (routeName: string) => {
    switch (routeName) {
      case 'Dashboard':
        return { label: 'Dashboard', icon: 'speedometer-outline' as const, filled: 'speedometer' as const };
      case 'Orders':
        return { label: 'Orders', icon: 'receipt-outline' as const, filled: 'receipt' as const };
      case 'Profile':
      default:
        return { label: 'Profile', icon: 'person-outline' as const, filled: 'person' as const };
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const config = getTabConfig(route.name);
        return {
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarButton: (props) => {
            const focused = props.accessibilityState?.selected ?? false;
            return (
              <AnimatedTabBarItem
                label={config.label}
                iconName={config.icon}
                iconFilledName={config.filled}
                focused={focused}
                onPress={props.onPress}
                activeColor={theme.colors.primary}
                inactiveColor={theme.colors.textMuted}
              />
            );
          },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.borderLight,
            height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 6,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 8,
          },
        };
      }}
    >
      <Tab.Screen name="Dashboard" component={HelperDashboardScreen as any} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Orders" component={HelperReportScreen as any} options={{ tabBarLabel: 'Orders' }} />
      <Tab.Screen name="Profile" component={HelperProfileScreen as any} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function HelperTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HelperTabsMain" component={HelperTabNavigator} />
      <Stack.Screen name="HelperOrderDetail" component={HelperOrderDetailScreen} />
    </Stack.Navigator>
  );
}
