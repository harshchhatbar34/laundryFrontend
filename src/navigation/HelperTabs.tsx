import React from 'react';
import { StyleSheet } from 'react-native';
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
  const tabBarHeight = 62 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: insets.bottom > 0 ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
          height: tabBarHeight,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
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
