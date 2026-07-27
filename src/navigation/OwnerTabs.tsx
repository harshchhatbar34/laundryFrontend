import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { getOwnerOrders } from '../api/owner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LivingTabBarItem } from '../components/ui/LivingTabBarItem';

import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import BranchListScreen from '../screens/owner/BranchListScreen';
import AddBranchScreen from '../screens/owner/AddBranchScreen';
import ServiceManagementScreen from '../screens/owner/ServiceManagementScreen';
import AddServiceElementScreen from '../screens/owner/AddServiceElementScreen';
import OwnerOrderListScreen from '../screens/owner/OwnerOrderListScreen';
import OwnerOrderDetailScreen from '../screens/owner/OwnerOrderDetailScreen';
import HelperManagementScreen from '../screens/owner/HelperManagementScreen';
import AddHelperScreen from '../screens/owner/AddHelperScreen';
import OwnerStatsScreen from '../screens/owner/OwnerStatsScreen';
import OwnerSettingsScreen from '../screens/owner/OwnerSettingsScreen';
import OwnerProfileScreen from '../screens/owner/OwnerProfileScreen';
import CustomerManagementScreen from '../screens/admin/CustomerManagementScreen';

export type OwnerDashStackParamList = {
  OwnerDashboardMain: undefined;
};

export type OwnerServiceStackParamList = {
  ServiceManagement: undefined;
  AddServiceElement: { type: 'service' | 'material' | 'item' | 'price'; id?: string; initialData?: any; editItem?: any } | undefined;
};

export type OwnerOrderStackParamList = {
  OwnerOrderList: undefined;
  OwnerOrderDetail: { orderId: string };
};

export type OwnerSettingsStackParamList = {
  OwnerSettingsMain: undefined;
  BranchList: undefined;
  AddBranch: { branchId?: string } | undefined;
  ProfileMain: undefined;
  HelperManagement: undefined;
  AddHelper: undefined;
  OwnerStats: { branchId?: string; activeTab?: 'overview' | 'reviews' } | undefined;
  CustomerManagement: undefined;
};

export type OwnerBranchStackParamList = OwnerSettingsStackParamList;

export type OwnerTabParamList = {
  Dashboard: undefined;
  Services: undefined;
  Orders: undefined;
  Settings: any;
};

const Tab = createBottomTabNavigator<OwnerTabParamList>();
const DashStack = createNativeStackNavigator<OwnerDashStackParamList>();
const ServiceStack = createNativeStackNavigator<OwnerServiceStackParamList>();
const OrderStack = createNativeStackNavigator<OwnerOrderStackParamList>();
const SettingsStack = createNativeStackNavigator<OwnerSettingsStackParamList>();

function DashStackScreen() {
  return (
    <DashStack.Navigator id="OwnerDashStack" screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="OwnerDashboardMain" component={OwnerDashboardScreen} />
    </DashStack.Navigator>
  );
}

function ServiceStackScreen() {
  return (
    <ServiceStack.Navigator id="OwnerServiceStack" screenOptions={{ headerShown: false }}>
      <ServiceStack.Screen name="ServiceManagement" component={ServiceManagementScreen as any} />
      <ServiceStack.Screen name="AddServiceElement" component={AddServiceElementScreen} />
    </ServiceStack.Navigator>
  );
}

function OwnerOrderStackScreen() {
  return (
    <OrderStack.Navigator id="OwnerOrderStack" screenOptions={{ headerShown: false }}>
      <OrderStack.Screen name="OwnerOrderList" component={OwnerOrderListScreen} />
      <OrderStack.Screen name="OwnerOrderDetail" component={OwnerOrderDetailScreen} />
    </OrderStack.Navigator>
  );
}

function OwnerSettingsStackScreen() {
  return (
    <SettingsStack.Navigator id="OwnerSettingsStack" screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="OwnerSettingsMain" component={OwnerSettingsScreen} />
      <SettingsStack.Screen name="BranchList" component={BranchListScreen as any} />
      <SettingsStack.Screen name="AddBranch" component={AddBranchScreen} />
      <SettingsStack.Screen name="ProfileMain" component={OwnerProfileScreen} />
      <SettingsStack.Screen name="HelperManagement" component={HelperManagementScreen as any} />
      <SettingsStack.Screen name="AddHelper" component={AddHelperScreen} />
      <SettingsStack.Screen name="OwnerStats" component={OwnerStatsScreen} />
      <SettingsStack.Screen name="CustomerManagement" component={CustomerManagementScreen} />
    </SettingsStack.Navigator>
  );
}

export default function OwnerTabs() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const rawHeight = Platform.OS === 'ios' ? 58 : 64;
  const tabBarHeight = rawHeight + insets.bottom;
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async (isSilent = false) => {
      try {
        const res = await getOwnerOrders({ status: 'pending' }, isSilent ? { hideLoader: true } : undefined);
        const orders = Array.isArray(res?.data) ? res.data : res?.data?.orders || [];
        setPendingCount(orders.length);
      } catch (e) {
        console.log(e);
      }
    };

    fetchPendingCount(false);
    const interval = setInterval(() => fetchPendingCount(true), 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      id="OwnerTabs"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarIconStyle: {
          width: '100%',
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: insets.bottom,
          paddingTop: 4,
          height: tabBarHeight,
          elevation: 0,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashStackScreen}
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            (e as any).preventDefault();
            (navigation as any).navigate('Dashboard', { screen: 'OwnerDashboardMain' });
          },
        })}
      />
      <Tab.Screen
        name="Services"
        component={ServiceStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <LivingTabBarItem
              name="services"
              label="Services"
              focused={focused}
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            (e as any).preventDefault();
            (navigation as any).navigate('Services', { screen: 'ServiceManagement' });
          },
        })}
      />
      <Tab.Screen
        name="Orders"
        component={OwnerOrderStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <LivingTabBarItem
              name="orders"
              label="Orders"
              focused={focused}
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
              badgeCount={pendingCount}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            (e as any).preventDefault();
            (navigation as any).navigate('Orders', { screen: 'OwnerOrderList' });
          },
        })}
      />
      <Tab.Screen
        name="Settings"
        component={OwnerSettingsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <LivingTabBarItem
              name="settings"
              label="Settings"
              focused={focused}
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            (e as any).preventDefault();
            (navigation as any).navigate('Settings', { screen: 'OwnerSettingsMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
}
