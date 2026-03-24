import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import { formatCurrency, formatMessageTime } from '@/utils/formatters';

const ChatBubble = ({
  message,
  isMine,
  listing,
  onAccept,
  onDecline,
  onPressOffer
}) => {
  const theme = useTheme();

  if (message.type === 'system') {
    return (
      <View style={{ alignItems: 'center', marginVertical: theme.spacing.sm }}>
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.pill,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm
          }}
        >
          <AppText variant="micro" color={theme.colors.textSecondary}>
            {message.text}
          </AppText>
        </View>
      </View>
    );
  }

  if (message.type === 'offer' && listing) {
    return (
      <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
        <Pressable
          onPress={onPressOffer}
          style={({ pressed }) => [
            {
              width: 240,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.borderStrong,
              overflow: 'hidden',
              opacity: pressed ? 0.9 : 1
            },
            theme.shadows.card
          ]}
        >
          <View style={{ height: 220, backgroundColor: theme.colors.backgroundAlt }}>
            <View
              style={{
                position: 'absolute',
                top: theme.spacing.md,
                right: theme.spacing.md,
                zIndex: 2,
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.sm,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs
              }}
            >
              <AppText variant="micro" color={theme.colors.white}>
                Offer
              </AppText>
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.backgroundAlt,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="game-controller-outline" size={36} color={theme.colors.textMuted} />
              </View>
            </View>
          </View>
          <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
            <AppText variant="card" numberOfLines={1}>
              {listing.title}
            </AppText>
            <AppText variant="bodyBold" color={theme.colors.primary}>
              {formatCurrency(message.offerAmount || listing.price)}
            </AppText>
            <AppText variant="micro" color={theme.colors.textSecondary}>
              Tap to view listing details
            </AppText>
          </View>
        </Pressable>
        {!isMine ? (
          <View
            style={{
              flexDirection: 'row',
              gap: theme.spacing.sm,
              marginTop: theme.spacing.sm
            }}
          >
            <Button variant="danger" size="sm" onPress={onDecline}>
              Decline
            </Button>
            <Button variant="primary" size="sm" onPress={onAccept}>
              Accept
            </Button>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
      <View
        style={{
          maxWidth: '82%',
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.lg,
          backgroundColor: isMine ? theme.colors.primary : theme.colors.surface,
          borderWidth: isMine ? 0 : 1,
          borderColor: theme.colors.border
        }}
      >
        <AppText variant="body" color={isMine ? theme.colors.white : theme.colors.textPrimary}>
          {message.text}
        </AppText>
        <AppText
          variant="micro"
          color={isMine ? 'rgba(255,255,255,0.72)' : theme.colors.textMuted}
          style={{ marginTop: 8, alignSelf: 'flex-end' }}
        >
          {formatMessageTime(message.createdAt)}
        </AppText>
      </View>
    </View>
  );
};

export default React.memo(ChatBubble);
