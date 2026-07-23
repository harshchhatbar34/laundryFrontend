import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedTabBarItem } from '../components/ui/AnimatedTabBarItem';

import HelperDashboardScreen from '../screens/helper/HelperDashboardScreen';
import HelperOrderDetailScreen from '../screens/helper/HelperOrderDetailScreen';
import HelperReportScreen from '../screens/helper/HelperReportScreen';
import HelperProfileScreen from '../screens/profile/HelperProfileScreen';

export type HelperStackParamList = {
  HelperTabsMain: undefined;
  HelperOrderDetail: { orderId: string };
};

export type HelperTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<HelperTabParamList>();
const Stack = createNativeStackNavigator<HelperStackParamList>();

function HelperTabNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          paddingBottom: 0,
          paddingTop: 0,
          height: tabBarHeight,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HelperDashboardScreen as any}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabBarItem
              label="Dashboard"
              iconName="speedometer-outline"
              iconFilledName="speedometer"
              focused={focused}
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={HelperReportScreen as any}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabBarItem
              label="Orders"
              iconName="receipt-outline"
              iconFilledName="receipt"
              focused={focused}
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={HelperProfileScreen as any}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabBarItem
              label="Profile"
              iconName="person-outline"
              iconFilledName="person"
              focused={focused}
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
      />
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
