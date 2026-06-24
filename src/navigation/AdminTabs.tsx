import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

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
  return (
    <Tab.Navigator
      id="AdminTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = { 
            Dashboard: focused ? 'grid' : 'grid-outline', 
            Owners: focused ? 'business' : 'business-outline',
            Customers: focused ? 'people' : 'people-outline', 
            Orders: focused ? 'receipt' : 'receipt-outline',
            Settings: focused ? 'settings' : 'settings-outline' 
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.tabBarActive, 
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: { 
          backgroundColor: theme.colors.tabBar, 
          borderTopColor: theme.colors.border, 
          paddingBottom: 8, paddingTop: 8, height: 60 
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashStackScreen} />
      <Tab.Screen name="Owners" component={OwnerStackScreen} />
      <Tab.Screen name="Customers" component={CustomerStackScreen} />
      <Tab.Screen name="Orders" component={OrderStackScreen} />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
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
