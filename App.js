import React from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './src/theme/ThemeProvider';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalUI from './src/components/GlobalUI';
import { setCart } from './src/store/orderSlice';

function AppBootstrapper({ children }) {
  React.useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('@cart');
        if (savedCart) {
          store.dispatch(setCart(JSON.parse(savedCart)));
        }
      } catch (e) {
        console.log('Failed to load cart', e);
      }
    };
    loadCart();
  }, []);
  return children;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppBootstrapper>
            <ThemeProvider>
              <AppNavigator />
              <GlobalUI />
            </ThemeProvider>
          </AppBootstrapper>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
