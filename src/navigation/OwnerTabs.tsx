import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getOwnerOrders } from '../api/owner';

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
  OwnerStats: { branchId?: string } | undefined;
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

    // Poll every 15 seconds silently to keep the badge fresh
    const interval = setInterval(() => fetchPendingCount(true), 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      id="OwnerTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = { 
            Dashboard: focused ? 'grid' : 'grid-outline', 
            Branches: focused ? 'storefront' : 'storefront-outline',
            Services: focused ? 'layers' : 'layers-outline', 
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
      <Tab.Screen 
        name="Dashboard" 
        component={DashStackScreen} 
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
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.colors.error, color: '#FFF' }
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
