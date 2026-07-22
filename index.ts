import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import App from './App';

// ─── Android Notification Channel (must exist before first notification arrives) ───
// On Android 8+, the OS silently drops notifications if the channel doesn't exist.
// Creating it here at app startup (not just at login) ensures it's always ready.
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'LaundroFlow',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6366F1',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

