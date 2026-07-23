import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedTabBarItem } from '../components/ui/AnimatedTabBarItem';

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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      id="AdminTabs"
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
        component={DashStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabBarItem
              label="Dashboard"
              iconName="grid-outline"
              iconFilledName="grid"
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
            <AnimatedTabBarItem
              label="Owners"
              iconName="business-outline"
              iconFilledName="business"
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
            <AnimatedTabBarItem
              label="Customers"
              iconName="people-outline"
              iconFilledName="people"
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
        name="Settings"
        component={SettingsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabBarItem
              label="Settings"
              iconName="settings-outline"
              iconFilledName="settings"
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
