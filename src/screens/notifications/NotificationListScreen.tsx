import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { useTheme } from '../../theme/ThemeContext';
import { getNotifications, markAllRead } from '../../api/notifications';
import { getRelativeTime } from '../../utils/helpers';

interface Props {
  navigation: any;
}

export default function NotificationListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await getNotifications();
      if (res?.data) setNotifications(Array.isArray(res.data) ? res.data : res.data.notifications || []);
    } catch (e) { console.log(e); }
  }, []);

  useEffect(() => { fetch(); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };

  const handleMarkAll = async () => { await markAllRead(); fetch(); };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={{ marginBottom: 10 }} padding="medium">
      <View style={styles.row}>
        {!item.isRead && <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />}
        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: item.isRead ? '400' : '600' }]}>
            {item.message}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 4 }]}>
            {getRelativeTime(item.createdAt)}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper edges={[]}>
      <Header title="Notifications" showBack onBack={() => navigation.goBack()}
        rightIcon="checkmark-done-outline" onRightPress={handleMarkAll} />
      <FlatList data={notifications} renderItem={renderItem} keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="No notifications" description="You're all caught up!" />}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10, marginTop: 6 },
});
