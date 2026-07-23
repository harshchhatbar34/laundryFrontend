import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedLottieTabIcon } from '../components/ui/AnimatedLottieTabIcon';

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
  const tabBarHeight = 72 + insets.bottom;

  return (
    <Tab.Navigator
      id="AdminTabs"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 0,
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
        component={DashStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedLottieTabIcon
              source={require('../assets/lottie/dashboard.json')}
              focused={focused}
              label="Dashboard"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
              size={44}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Owners"
        component={OwnerStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedLottieTabIcon
              source={require('../assets/lottie/store.json')}
              focused={focused}
              label="Owners"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
              size={44}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomerStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedLottieTabIcon
              source={require('../assets/lottie/profile.json')}
              focused={focused}
              label="Customers"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
              size={44}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedLottieTabIcon
              source={require('../assets/lottie/orders.json')}
              focused={focused}
              label="Orders"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
              size={44}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedLottieTabIcon
              source={require('../assets/lottie/settings.json')}
              focused={focused}
              label="Settings"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
              size={44}
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
