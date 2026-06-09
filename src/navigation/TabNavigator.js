import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../theme/ThemeProvider';

import HomeScreen from '../screens/home/HomeScreen';
import ServiceDetailScreen from '../screens/home/ServiceDetailScreen';
import CreateOrderScreen from '../screens/order/CreateOrderScreen';
import OrderDetailScreen from '../screens/order/OrderDetailScreen';
import OrderListScreen from '../screens/order/OrderListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CartScreen from '../screens/order/CartScreen';
import AddressListScreen from '../screens/address/AddressListScreen';
import AddAddressScreen from '../screens/address/AddAddressScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcon = (name) => ({ color }) => <Text style={{ fontSize: 22 }}>{name}</Text>;

function HomeStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.headerBg }, headerTintColor: theme.colors.headerText, headerShadowVisible: false }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'New Order' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.headerBg }, headerTintColor: theme.colors.headerText, headerShadowVisible: false }}>
      <Stack.Screen name="OrderList" component={OrderListScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.headerBg }, headerTintColor: theme.colors.headerText, headerShadowVisible: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddressList" component={AddressListScreen} options={{ title: 'My Addresses' }} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} options={{ title: 'Add New Address' }} />
    </Stack.Navigator>
  );
}

function CartStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.headerBg }, headerTintColor: theme.colors.headerText, headerShadowVisible: false }}>
      <Stack.Screen name="CartView" component={CartScreen} options={{ title: 'Cart' }} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  const { theme } = useTheme();
  const { cart } = useSelector((s) => s.orders);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home', tabBarIcon: tabIcon('🏠') }} />
      <Tab.Screen 
        name="CartTab" 
        component={CartStack} 
        options={{ 
          tabBarLabel: 'Cart', 
          tabBarIcon: tabIcon('🛒'),
          tabBarBadge: cart.length > 0 ? cart.length : null,
          tabBarBadgeStyle: { backgroundColor: theme.colors.primary, color: '#FFFFFF', fontSize: 10 }
        }} 
      />
      <Tab.Screen name="OrdersTab" component={OrdersStack} options={{ tabBarLabel: 'Orders', tabBarIcon: tabIcon('📦') }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Profile', tabBarIcon: tabIcon('👤') }} />
    </Tab.Navigator>
  );
}
