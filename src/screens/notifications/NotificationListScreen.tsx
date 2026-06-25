import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { useTheme } from '../../theme/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { USER_ROLES } from '../../utils/constants';
import { getNotifications, markAllRead } from '../../api/notifications';
import { getRelativeTime } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
}

// Resolve the notification message from various possible field names
const resolveMessage = (item: any): string => {
  return (
    item.message ||
    item.body ||
    item.content ||
    item.text ||
    item.description ||
    item.title ||
    item.notification?.message ||
    item.notification?.body ||
    item.notification?.title ||
    ''
  );
};

// Resolve the notification title from various possible field names
const resolveTitle = (item: any): string => {
  return (
    item.title ||
    item.subject ||
    item.heading ||
    item.notification?.title ||
    ''
  );
};

// Map notification type to icon
const getNotifIcon = (item: any): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  const type = item.type || item.category || '';
  if (type.includes('bill') || type.includes('update') || type.includes('order'))
    return { name: 'receipt-outline', color: '#F59E0B' };
  if (type.includes('confirm') || type.includes('pickup') || type.includes('accept'))
    return { name: 'checkmark-circle-outline', color: '#10B981' };
  if (type.includes('reject') || type.includes('cancel'))
    return { name: 'close-circle-outline', color: '#EF4444' };
  if (type.includes('deliver') || type.includes('complete'))
    return { name: 'bag-check-outline', color: '#6366F1' };
  return { name: 'notifications-outline', color: '#6366F1' };
};

export default function NotificationListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleNotificationPress = (item: any) => {
    const orderId = item.refId || item.orderId || (item.data && item.data.orderId);
    if (!orderId) return;

    // Pop the Notifications screen first so the stack returns to the root screen (HomeMain or ProfileMain)
    navigation.goBack();

    if (user?.role === USER_ROLES.CUSTOMER) {
      navigation.navigate('Orders', { screen: 'OrderDetail', params: { orderId } });
    } else if (user?.role === USER_ROLES.OWNER) {
      navigation.navigate('Orders', { screen: 'OwnerOrderDetail', params: { orderId } });
    } else if (user?.role === USER_ROLES.HELPER) {
      navigation.navigate('HelperOrderDetail', { orderId });
    }
  };


  const fetch = useCallback(async () => {
    try {
      const res = await getNotifications();
      console.log('[Notifications] Raw response:', JSON.stringify(res?.data)?.slice(0, 500));
      if (res?.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.notifications || [];
        setNotifications(list);
      }
    } catch (e) { console.log(e); }
  }, []);

  useFocusEffect(useCallback(() => { fetch(); }, [fetch]));
  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

  const handleMarkAll = async () => {
    await markAllRead();
    fetch();
  };

  const isUnread = (item: any) => !item.isRead && !item.read;

  const renderItem = ({ item }: { item: any }) => {
    const message = resolveMessage(item);
    const title = resolveTitle(item);
    const icon = getNotifIcon(item);
    const unread = isUnread(item);

    return (
      <Card
        style={[
          styles.card,
          unread && { borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
        ]}
        padding="medium"
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.row}>
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: icon.color + '15' }]}>
            <Ionicons name={icon.name} size={20} color={icon.color} />
          </View>

          {/* Content */}
          <View style={{ flex: 1, marginLeft: 12 }}>
            {/* Title */}
            {title ? (
              <Text style={[theme.typography.label, { color: theme.colors.textPrimary, marginBottom: 2 }]}>
                {title}
              </Text>
            ) : null}

            {/* Message body */}
            <Text
              style={[
                theme.typography.bodySmall,
                {
                  color: unread ? theme.colors.textPrimary : theme.colors.textSecondary,
                  fontWeight: unread ? '600' : '400',
                  lineHeight: 18,
                },
              ]}
            >
              {message || 'No message content'}
            </Text>

            {/* Time */}
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 4 }]}>
              {getRelativeTime(item.createdAt)}
            </Text>
          </View>

          {/* Unread dot */}
          {unread && (
            <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
          )}
        </View>
      </Card>
    );
  };

  return (
    <ScreenWrapper edges={[]}>
      <Header
        title="Notifications"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="checkmark-done-outline"
        onRightPress={handleMarkAll}
      />
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(i) => i._id || String(Math.random())}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications"
            description="You're all caught up!"
          />
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8, marginTop: 4 },
});
