import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import SetPasswordScreen from '../screens/auth/SetPasswordScreen';
import VerifyOTPScreen from '../screens/auth/VerifyOTPScreen';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: { tenantCode?: string } | undefined;
  ForgotPassword: undefined;
  SetPassword: { token?: string } | undefined;
  VerifyOTP: { userId: string; email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator id="AuthStack" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
    </Stack.Navigator>
  );
}
