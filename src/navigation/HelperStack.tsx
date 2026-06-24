import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HelperDashboardScreen from '../screens/helper/HelperDashboardScreen';
import HelperOrderDetailScreen from '../screens/helper/HelperOrderDetailScreen';
import HelperProfileScreen from '../screens/profile/HelperProfileScreen';

export type HelperStackParamList = {
  HelperDashboard: undefined;
  HelperOrderDetail: { orderId: string };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<HelperStackParamList>();

export default function HelperStack() {
  return (
    <Stack.Navigator id="HelperStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HelperDashboard" component={HelperDashboardScreen} />
      <Stack.Screen name="HelperOrderDetail" component={HelperOrderDetailScreen} />
      <Stack.Screen name="Profile" component={HelperProfileScreen} />
    </Stack.Navigator>
  );
}
