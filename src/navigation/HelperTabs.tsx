import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LivingTabBarItem } from '../components/ui/LivingTabBarItem';

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
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 62 + insets.bottom;

  return (
    <Tab.Navigator
      id="HelperTabs"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 0,
        },
        // iOS: transparent so BlurView shows through; Android: solid background
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
          height: tabBarHeight,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: Platform.OS === 'ios' ? 0.18 : 0.1,
          shadowRadius: Platform.OS === 'ios' ? 16 : 10,
          position: Platform.OS === 'ios' ? 'absolute' : 'relative',
        },
        tabBarBackground: Platform.OS === 'ios'
          ? () => (
              <BlurView
                intensity={85}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            )
          : undefined,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HelperDashboardScreen as any}
        options={{
          tabBarIcon: ({ focused }) => (
            <LivingTabBarItem
              name="dashboard"
              label="Dashboard"
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
            <LivingTabBarItem
              name="orders"
              label="Orders"
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
            <LivingTabBarItem
              name="settings"
              label="Profile"
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
