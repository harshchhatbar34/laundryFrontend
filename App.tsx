import React, { useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
// import * as Sentry from '@sentry/react-native'; // Temporarily disabled - causes SIGABRT on startup
import store from './src/store';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalOverlay from './src/components/GlobalOverlay';
import ErrorBoundary from './src/components/ErrorBoundary';

// Sentry.init temporarily disabled - investigating SIGABRT conflict with Hermes/Worklets

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
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
