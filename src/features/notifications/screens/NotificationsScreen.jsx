import React from 'react';
import { FlatList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import NotificationCard from '@/components/cards/NotificationCard';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import useNotificationStore from '@/store/notificationStore';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const notifications = useNotificationStore((state) => state.notifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);

  const handlePress = (notification) => {
    if (!notification.readAt) {
      markRead(notification.id);
    }

    if (notification.conversationId) {
      navigation.navigate('ChatView', { conversationId: notification.conversationId });
      return;
    }

    if (notification.listingId) {
      navigation.navigate('ListingDetail', { listingId: notification.listingId });
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
        </Button>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="page">Notifications</AppText>
          <AppText variant="micro" color={theme.colors.textSecondary}>
            Messages, offers, price drops, stories, and premium alerts
          </AppText>
        </View>
        <Button variant="secondary" size="sm" onPress={markAllRead}>
          Mark All
        </Button>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.huge * 2, gap: theme.spacing.md }}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onMarkRead={() => markRead(item.id)}
            onPress={() => handlePress(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No notifications"
            description="Unread activity from chats, stories, and saved listings will appear here."
          />
        }
      />
    </ScreenContainer>
  );
};

export default NotificationsScreen;
