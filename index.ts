import './src/utils/debugLogger';
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

console.log('[STARTUP] index.ts loaded, registering root component');

// ─── Android Notification Channel (must exist before first notification arrives) ───
if (Platform.OS === 'android' && !__DEV__) {
  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationChannelAsync('default', {
      name: 'LaundroFlow',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    }).catch(() => {});
  } catch {}
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

