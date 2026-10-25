import React, { useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
// import * as Sentry from '@sentry/react-native'; // Temporarily disabled - causes SIGABRT on startup
import store from './src/store';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalOverlay from './src/components/GlobalOverlay';
import ErrorBoundary from './src/components/ErrorBoundary';

// Sentry.init temporarily disabled - investigating SIGABRT conflict with Hermes/Worklets
console.log('[STARTUP] App.tsx module evaluated');

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  console.log('[STARTUP] App component rendering');
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Outfit_400Regular,
          Outfit_500Medium,
          Outfit_600SemiBold,
          Outfit_700Bold,
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
        });
        setFontsLoaded(true);
      } catch (e) {
        if (__DEV__) {
          console.warn('Font loading error:', e);
        }
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider onLayout={onLayoutRootView}>
          <ThemeProvider>
            <AppNavigator />
            <GlobalOverlay />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}
