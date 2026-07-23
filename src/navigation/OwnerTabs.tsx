import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { getOwnerOrders } from '../api/owner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumTabBarItem } from '../components/ui/PremiumTabBarItem';

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

export type OwnerBranchStackParamList = {
  BranchList: undefined;
  AddBranch: { branchId?: string } | undefined;
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
  ProfileMain: undefined;
  HelperManagement: undefined;
  AddHelper: undefined;
  OwnerStats: { branchId?: string; activeTab?: 'overview' | 'reviews' } | undefined;
  CustomerManagement: undefined;
};

export type OwnerTabParamList = {
  Dashboard: undefined;
  Branches: undefined;
  Services: undefined;
  Orders: undefined;
  Settings: any;
};

const Tab = createBottomTabNavigator<OwnerTabParamList>();
const DashStack = createNativeStackNavigator<OwnerDashStackParamList>();
const BranchStack = createNativeStackNavigator<OwnerBranchStackParamList>();
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

function BranchStackScreen() {
  return (
    <BranchStack.Navigator id="OwnerBranchStack" screenOptions={{ headerShown: false }}>
      <BranchStack.Screen name="BranchList" component={BranchListScreen} />
      <BranchStack.Screen name="AddBranch" component={AddBranchScreen} />
    </BranchStack.Navigator>
  );
}

function ServiceStackScreen() {
  return (
    <ServiceStack.Navigator id="OwnerServiceStack" screenOptions={{ headerShown: false }}>
      <ServiceStack.Screen name="ServiceManagement" component={ServiceManagementScreen} />
      <ServiceStack.Screen name="AddServiceElement" component={AddServiceElementScreen} />
    </ServiceStack.Navigator>
  );
}

function OrderStackScreen() {
  return (
    <OrderStack.Navigator id="OwnerOrderStack" screenOptions={{ headerShown: false }}>
      <OrderStack.Screen name="OwnerOrderList" component={OwnerOrderListScreen} />
      <OrderStack.Screen name="OwnerOrderDetail" component={OwnerOrderDetailScreen} />
    </OrderStack.Navigator>
  );
}

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator id="OwnerSettingsStack" screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="OwnerSettingsMain" component={OwnerSettingsScreen} />
      <SettingsStack.Screen name="ProfileMain" component={OwnerProfileScreen} />
      <SettingsStack.Screen name="HelperManagement" component={HelperManagementScreen} />
      <SettingsStack.Screen name="AddHelper" component={AddHelperScreen} />
      <SettingsStack.Screen name="OwnerStats" component={OwnerStatsScreen} />
      <SettingsStack.Screen name="CustomerManagement" component={CustomerManagementScreen} />
    </SettingsStack.Navigator>
  );
}

export default function OwnerTabs() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 62 + insets.bottom;
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async (isSilent = false) => {
      try {
        const res = await getOwnerOrders({ status: 'pending' }, isSilent ? { hideLoader: true } : undefined);
        if (res?.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.orders || [];
          setPendingCount(list.length);
        }
      } catch (e) {
        console.log('Error fetching pending orders count:', e);
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
                tint={theme.dark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            )
          : undefined,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PremiumTabBarItem
              iconName="grid"
              focused={focused}
              label="Dashboard"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e: any) => {
            e.preventDefault();
            (navigation as any).navigate('Dashboard', { screen: 'OwnerDashboardMain' });
          },
        })}
      />
      <Tab.Screen
        name="Branches"
        component={BranchStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PremiumTabBarItem
              iconName="storefront"
              focused={focused}
              label="Branches"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e: any) => {
            e.preventDefault();
            (navigation as any).navigate('Branches', { screen: 'BranchList' });
          },
        })}
      />
      <Tab.Screen
        name="Services"
        component={ServiceStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PremiumTabBarItem
              iconName="layers"
              focused={focused}
              label="Services"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e: any) => {
            e.preventDefault();
            (navigation as any).navigate('Services', { screen: 'ServiceManagement' });
          },
        })}
      />
      <Tab.Screen
        name="Orders"
        component={OrderStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PremiumTabBarItem
              iconName="receipt"
              focused={focused}
              label="Orders"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
              badgeCount={pendingCount}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e: any) => {
            e.preventDefault();
            (navigation as any).navigate('Orders', { screen: 'OwnerOrderList' });
          },
        })}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PremiumTabBarItem
              iconName="settings"
              focused={focused}
              label="Settings"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e: any) => {
            e.preventDefault();
            (navigation as any).navigate('Settings', { screen: 'OwnerSettingsMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
}
