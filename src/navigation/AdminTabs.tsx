import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

import { AnimatedTabBarItem } from '../components/ui/AnimatedTabBarItem';

export default function AdminTabs() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  const getTabConfig = (routeName: string) => {
    switch (routeName) {
      case 'Dashboard':
        return { label: 'Dashboard', icon: 'grid-outline' as const, filled: 'grid' as const };
      case 'Owners':
        return { label: 'Owners', icon: 'business-outline' as const, filled: 'business' as const };
      case 'Customers':
        return { label: 'Customers', icon: 'people-outline' as const, filled: 'people' as const };
      case 'Orders':
        return { label: 'Orders', icon: 'receipt-outline' as const, filled: 'receipt' as const };
      case 'Settings':
      default:
        return { label: 'Settings', icon: 'settings-outline' as const, filled: 'settings' as const };
    }
  };

  return (
    <Tab.Navigator
      id="AdminTabs"
      screenOptions={({ route }) => {
        const config = getTabConfig(route.name);
        return {
          headerShown: false,
          tabBarActiveTintColor: theme.colors.tabBarActive,
          tabBarInactiveTintColor: theme.colors.tabBarInactive,
          tabBarButton: (props) => {
            const focused = props.accessibilityState?.selected ?? false;
            return (
              <AnimatedTabBarItem
                label={config.label}
                iconName={config.icon}
                iconFilledName={config.filled}
                focused={focused}
                onPress={props.onPress}
                activeColor={theme.colors.tabBarActive}
                inactiveColor={theme.colors.tabBarInactive}
              />
            );
          },
          tabBarStyle: {
            backgroundColor: theme.colors.tabBar,
            borderTopColor: theme.colors.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 6,
            height: tabBarHeight,
          },
        };
      }}
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
