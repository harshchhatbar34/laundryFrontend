import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getOrders } from '../api/orders';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/home/HomeScreen';
import ServiceDetailScreen from '../screens/home/ServiceDetailScreen';
import BranchCatalogScreen from '../screens/home/BranchCatalogScreen';
import CartScreen from '../screens/order/CartScreen';
import OrderListScreen from '../screens/order/OrderListScreen';
import OrderDetailScreen from '../screens/order/OrderDetailScreen';
import RatingScreen from '../screens/order/RatingScreen';
import CustomerProfileScreen from '../screens/profile/CustomerProfileScreen';
import AddressListScreen from '../screens/address/AddressListScreen';
import AddAddressScreen from '../screens/address/AddAddressScreen';
import NotificationListScreen from '../screens/notifications/NotificationListScreen';
import BranchNavigationScreen from '../screens/navigation/BranchNavigationScreen';
import { PremiumTabBarItem } from '../components/ui/PremiumTabBarItem';

export type HomeStackParamList = {
  HomeMain: undefined;
  BranchCatalog: { branch: any; masters: any };
  BranchNavigation: { branch: any };
  ServiceDetail: { service: any; masters: any; branch?: any };
  Cart: undefined;
  Notifications: undefined;
};

export type OrderStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: string };
  Rating: { orderId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  AddressList: undefined;
  AddAddress: undefined;
  Notifications: undefined;
};

export type CustomerTabParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const OrderStack = createNativeStackNavigator<OrderStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator id="HomeStack" screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="BranchCatalog" component={BranchCatalogScreen} />
      <HomeStack.Screen name="BranchNavigation" component={BranchNavigationScreen} />
      <HomeStack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <HomeStack.Screen name="Cart" component={CartScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationListScreen} />
    </HomeStack.Navigator>
  );
}

function OrderStackScreen() {
  return (
    <OrderStack.Navigator id="OrderStack" screenOptions={{ headerShown: false }}>
      <OrderStack.Screen name="OrderList" component={OrderListScreen} />
      <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <OrderStack.Screen name="Rating" component={RatingScreen} />
    </OrderStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator id="ProfileStack" screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={CustomerProfileScreen} />
      <ProfileStack.Screen name="AddressList" component={AddressListScreen} />
      <ProfileStack.Screen name="AddAddress" component={AddAddressScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationListScreen} />
    </ProfileStack.Navigator>
  );
}

export default function CustomerTabs() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 62 + insets.bottom;
  const cart = useSelector((s: RootState) => s.orders.cart);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    const fetchUpdateCount = async (isSilent = false) => {
      try {
        const res = await getOrders(undefined, isSilent ? { hideLoader: true } : undefined);
        const orders = Array.isArray(res?.data) ? res.data : res?.data?.orders || [];
        const count = orders.filter((o: any) => o.billUpdated && !o.billConfirmed).length;
        setUpdateCount(count);
      } catch (e) {
        console.log(e);
      }
    };

    fetchUpdateCount(false);
    const interval = setInterval(() => fetchUpdateCount(true), 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      id="CustomerTabs"
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
          // elevation only affects Android — no-op on iOS
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: Platform.OS === 'ios' ? 0.18 : 0.1,
          shadowRadius: Platform.OS === 'ios' ? 16 : 10,
          position: Platform.OS === 'ios' ? 'absolute' : 'relative',
        },
        // iOS frosted glass blur background (BlurView) — null on Android
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
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PremiumTabBarItem
              iconName="home"
              focused={focused}
              label="Home"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            (e as any).preventDefault();
            (navigation as any).navigate('Home', { screen: 'HomeMain' });
          },
        })}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PremiumTabBarItem
              iconName="cart"
              focused={focused}
              label="Cart"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
              badgeCount={cartItemCount}
            />
          ),
        }}
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
              badgeCount={updateCount}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            (e as any).preventDefault();
            (navigation as any).navigate('Orders', { screen: 'OrderList' });
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PremiumTabBarItem
              iconName="person"
              focused={focused}
              label="Profile"
              activeColor={theme.colors.tabBarActive}
              inactiveColor={theme.colors.tabBarInactive}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            (e as any).preventDefault();
            (navigation as any).navigate('Profile', { screen: 'ProfileMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
}
