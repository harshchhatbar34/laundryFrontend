// FreshWash — Reminder Notification Service
// Schedules Zomato-style re-engagement local notifications that fire
// even when the app is completely closed.

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDER_IDS_KEY = '@reminder_notification_ids';

// ── Reminder Templates ────────────────────────────────────────────────

const WEEKLY_REMINDERS = [
  {
    title: "Time for fresh laundry! 🧺",
    body: "Don't let the pile grow! Book a pickup in seconds.",
  },
  {
    title: "Laundry day? We've got you! 👕",
    body: "Schedule a pickup now and get your clothes back fresh & folded.",
  },
  {
    title: "Your wardrobe misses you 👔",
    body: "It's been a while — book a laundry pickup today!",
  },
  {
    title: "Fresh week, fresh clothes! ✨",
    body: "Start the week right. Book your laundry pickup now.",
  },
];

const RE_ENGAGEMENT_REMINDERS = [
  {
    title: "We miss you! 🥺",
    body: "Haven't used LaundroFlow in a while? Fresh clothes are just a tap away.",
  },
  {
    title: "Your laundry won't wash itself 😄",
    body: "Book a pickup now — we'll handle the rest!",
  },
  {
    title: "Special reminder for you 🎁",
    body: "Come back and book your laundry pickup today. Easy, fast & affordable!",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const saveReminderIds = async (ids: string[]) => {
  await AsyncStorage.setItem(REMINDER_IDS_KEY, JSON.stringify(ids));
};

const loadReminderIds = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// ── Schedule Reminders ────────────────────────────────────────────────

/**
 * Schedules all reminder notifications for a logged-in user.
 * Call this once after login or registration.
 */
export const scheduleReminderNotifications = async (): Promise<void> => {
  try {
    // Cancel any previously scheduled reminders first
    await cancelReminderNotifications();

    const ids: string[] = [];

    // 1. Weekly reminder — every Monday at 10:00 AM
    const weeklyReminder = getRandomItem(WEEKLY_REMINDERS);
    const weeklyId = await Notifications.scheduleNotificationAsync({
      content: {
        title: weeklyReminder.title,
        body: weeklyReminder.body,
        sound: 'default',
        data: { type: 'reminder', screen: 'home' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 2, // Monday (1=Sunday, 2=Monday, ..., 7=Saturday)
        hour: 10,
        minute: 0,
      },
    });
    ids.push(weeklyId);

    // 2. Mid-week nudge — every Thursday at 7:00 PM
    const midWeekReminder = getRandomItem(WEEKLY_REMINDERS);
    const midWeekId = await Notifications.scheduleNotificationAsync({
      content: {
        title: midWeekReminder.title,
        body: midWeekReminder.body,
        sound: 'default',
        data: { type: 'reminder', screen: 'home' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 5, // Thursday
        hour: 19,
        minute: 0,
      },
    });
    ids.push(midWeekId);

    // 3. Re-engagement — fires 3 days after login (one-shot)
    const reEngagement = getRandomItem(RE_ENGAGEMENT_REMINDERS);
    const reEngageId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reEngagement.title,
        body: reEngagement.body,
        sound: 'default',
        data: { type: 'reminder', screen: 'home' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3 * 24 * 60 * 60, // 3 days
        repeats: false,
      },
    });
    ids.push(reEngageId);

    // 4. Re-engagement — fires 7 days after login (one-shot)
    const reEngagement7 = getRandomItem(RE_ENGAGEMENT_REMINDERS);
    const reEngage7Id = await Notifications.scheduleNotificationAsync({
      content: {
        title: reEngagement7.title,
        body: reEngagement7.body,
        sound: 'default',
        data: { type: 'reminder', screen: 'home' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 7 * 24 * 60 * 60, // 7 days
        repeats: false,
      },
    });
    ids.push(reEngage7Id);

    await saveReminderIds(ids);
    console.log('[Reminders] Scheduled', ids.length, 'reminder notifications');
  } catch (e) {
    console.warn('[Reminders] Failed to schedule reminders:', e);
  }
};

/**
 * Cancels all previously scheduled reminder notifications.
 * Call this on logout.
 */
export const cancelReminderNotifications = async (): Promise<void> => {
  try {
    const ids = await loadReminderIds();
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    await AsyncStorage.removeItem(REMINDER_IDS_KEY);
    console.log('[Reminders] Cancelled', ids.length, 'reminder notifications');
  } catch (e) {
    console.warn('[Reminders] Failed to cancel reminders:', e);
  }
};
