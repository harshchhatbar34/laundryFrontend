import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LivingTabBarItem } from '../components/ui/LivingTabBarItem';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import OwnerManagementScreen from '../screens/admin/OwnerManagementScreen';
import CreateOwnerScreen from '../screens/admin/CreateOwnerScreen';
import EditOwnerScreen from '../screens/admin/EditOwnerScreen';
import TenantCodeScreen from '../screens/admin/TenantCodeScreen';
import CustomerManagementScreen from '../screens/admin/CustomerManagementScreen';
import AdminOrderListScreen from '../screens/admin/AdminOrderListScreen';
import CouponManagementScreen from '../screens/admin/CouponManagementScreen';
import AddCouponScreen from '../screens/admin/AddCouponScreen';
import PlatformStatsScreen from '../screens/admin/PlatformStatsScreen';
import AdminProfileScreen from '../screens/profile/AdminProfileScreen';

export type AdminDashStackParamList = {
  AdminDashboardMain: undefined;
};

export type AdminOwnerStackParamList = {
  OwnerManagement: undefined;
  CreateOwner: undefined;
  EditOwner: { ownerId: string };
  TenantCode: undefined;
};

export type AdminCustomerStackParamList = {
  CustomerManagement: undefined;
};

export type AdminOrderStackParamList = {
  AdminOrderList: undefined;
};

export type AdminCouponStackParamList = {
  CouponManagement: undefined;
  AddCoupon: { couponId?: string } | undefined;
};

export type AdminSettingsStackParamList = {
  ProfileMain: undefined;
  PlatformStats: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Owners: undefined;
  Customers: undefined;
  Orders: undefined;
  Settings: any;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const DashStack = createNativeStackNavigator<AdminDashStackParamList>();
const OwnerStack = createNativeStackNavigator<AdminOwnerStackParamList>();
const CustomerStack = createNativeStackNavigator<AdminCustomerStackParamList>();
const OrderStack = createNativeStackNavigator<AdminOrderStackParamList>();
const CouponStack = createNativeStackNavigator<AdminCouponStackParamList>();
const SettingsStack = createNativeStackNavigator<AdminSettingsStackParamList>();

function DashStackScreen() {
  return (
    <DashStack.Navigator id="AdminDashStack" screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="AdminDashboardMain" component={AdminDashboardScreen} />
    </DashStack.Navigator>
  );
}

function OwnerStackScreen() {
  return (
    <OwnerStack.Navigator id="AdminOwnerStack" screenOptions={{ headerShown: false }}>
      <OwnerStack.Screen name="OwnerManagement" component={OwnerManagementScreen} />
      <OwnerStack.Screen name="CreateOwner" component={CreateOwnerScreen} />
      <OwnerStack.Screen name="EditOwner" component={EditOwnerScreen} />
      <OwnerStack.Screen name="TenantCode" component={TenantCodeScreen} />
    </OwnerStack.Navigator>
  );
}

function CustomerStackScreen() {
  return (
    <CustomerStack.Navigator id="AdminCustomerStack" screenOptions={{ headerShown: false }}>
      <CustomerStack.Screen name="CustomerManagement" component={CustomerManagementScreen} />
    </CustomerStack.Navigator>
  );
}

function OrderStackScreen() {
  return (
    <OrderStack.Navigator id="AdminOrderStack" screenOptions={{ headerShown: false }}>
      <OrderStack.Screen name="AdminOrderList" component={AdminOrderListScreen} />
    </OrderStack.Navigator>
  );
}

function CouponStackScreen() {
  return (
    <CouponStack.Navigator id="AdminCouponStack" screenOptions={{ headerShown: false }}>
      <CouponStack.Screen name="CouponManagement" component={CouponManagementScreen} />
      <CouponStack.Screen name="AddCoupon" component={AddCouponScreen} />
    </CouponStack.Navigator>
  );
}

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator id="AdminSettingsStack" screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="ProfileMain" component={AdminProfileScreen} />
      <SettingsStack.Screen name="PlatformStats" component={PlatformStatsScreen} />
    </SettingsStack.Navigator>
  );
}

export default function AdminTabs() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + insets.bottom;

  return (
    <Tab.Navigator
      id="AdminTabs"
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
      />
      <Tab.Screen
        name="Owners"
        component={OwnerStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <LivingTabBarItem
              name="branches"
              label="Owners"
              focused={focused}
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomerStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <LivingTabBarItem
              name="branches"
              label="Customers"
              focused={focused}
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderStackScreen}
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
        name="Settings"
        component={SettingsStackScreen}
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
          tabPress: (e: any) => {
            e.preventDefault();
            (navigation as any).navigate('Settings', { screen: 'ProfileMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
}
