import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import DriverOrderDetailScreen from '../screens/driver/DriverOrderDetailScreen';

const Stack = createNativeStackNavigator();

export default function DriverNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.headerBg },
        headerTintColor: theme.colors.headerText,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="DriverDashboard"
        component={DriverDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DriverOrderDetail"
        component={DriverOrderDetailScreen}
        options={{ title: 'Order Details', headerBackTitle: 'Back' }}
      />
    </Stack.Navigator>
  );
}
