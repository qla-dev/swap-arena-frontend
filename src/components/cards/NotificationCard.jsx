import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import { formatRelativeTime } from '@/utils/formatters';

const iconMap = {
  message: 'chatbubble-ellipses-outline',
  offer: 'pricetag-outline',
  price_drop: 'trending-down-outline',
  sold: 'bag-check-outline',
  premium_expiring: 'time-outline',
  story: 'play-circle-outline',
  transaction: 'swap-horizontal-outline'
};

const NotificationCard = ({
  notification,
  onPress,
  onMarkRead
}) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          padding: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: notification.readAt ? theme.colors.border : theme.colors.primary,
          opacity: pressed ? 0.9 : 1,
          gap: theme.spacing.md
        },
        theme.shadows.card
      ]}
    >
      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: notification.readAt ? theme.colors.backgroundAlt : theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons
            name={iconMap[notification.type] || 'notifications-outline'}
            size={22}
            color={notification.readAt ? theme.colors.textSecondary : theme.colors.white}
          />
        </View>
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
            <AppText variant="card">{notification.title}</AppText>
            {!notification.readAt ? (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: theme.colors.primary
                }}
              />
            ) : null}
          </View>
          <AppText variant="body" color={theme.colors.textSecondary}>
            {notification.description}
          </AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="micro" color={theme.colors.textMuted}>
              {formatRelativeTime(notification.createdAt)}
            </AppText>
            {!notification.readAt ? (
              <Button variant="ghost" size="sm" onPress={onMarkRead}>
                Mark read
              </Button>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default React.memo(NotificationCard);
