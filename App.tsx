import React, { useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import store from './src/store';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalOverlay from './src/components/GlobalOverlay';
import ErrorBoundary from './src/components/ErrorBoundary';

// Initialize Sentry as early as possible to catch all crashes
Sentry.init({
  dsn: 'https://532aeb9d27f46515fb61c69122bf0309@o4511655714422784.ingest.us.sentry.io/4511655722680320',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  // Enable debug mode in development to see Sentry logs in console
  debug: __DEV__,
});

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
    <Sentry.ErrorBoundary fallback={<ErrorBoundary><></></ErrorBoundary>}>
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
    </Sentry.ErrorBoundary>
  );
}
