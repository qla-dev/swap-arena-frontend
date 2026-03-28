import React from 'react';
import { Image, Pressable, View } from 'react-native';
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
  onCounter,
  onPressOffer
}) => {
  const theme = useTheme();

  const formatMediaDuration = (durationMs) => {
    if (!durationMs) {
      return null;
    }

    const totalSeconds = Math.max(1, Math.round(durationMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = `${totalSeconds % 60}`.padStart(2, '0');

    return `${minutes}:${seconds}`;
  };

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
            <Button variant="secondary" size="sm" onPress={onCounter}>
              Counter
            </Button>
            <Button variant="primary" size="sm" onPress={onAccept}>
              Accept
            </Button>
          </View>
        ) : null}
      </View>
    );
  }

  if (message.type === 'media') {
    const voiceDuration = formatMediaDuration(message.mediaDurationMs);
    const mediaMeta = {
      photo: {
        icon: 'image-outline',
        label: 'Photo'
      },
      video: {
        icon: 'videocam-outline',
        label: 'Video'
      },
      voice: {
        icon: 'mic-outline',
        label: 'Voice message'
      }
    }[message.mediaType] || {
      icon: 'attach-outline',
      label: 'Attachment'
    };
    const secondaryLine =
      message.mediaType === 'voice'
        ? voiceDuration || message.text
        : message.mediaType === 'video' && voiceDuration
          ? `Duration ${voiceDuration}`
          : message.mediaFileName || message.text;
    const tertiaryLine =
      message.mediaType === 'photo'
        ? message.mediaFileName ? message.text : 'Shared from your device'
        : message.mediaType === 'video' && message.mediaFileName
          ? message.text
          : null;

    return (
      <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
        <View
          style={{
            maxWidth: '82%',
            minWidth: 190,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.radius.lg,
            backgroundColor: isMine ? theme.colors.primary : theme.colors.surface,
            borderWidth: isMine ? 0 : 1,
            borderColor: theme.colors.border
          }}
        >
          {message.mediaType === 'photo' && message.mediaUri ? (
            <Image
              source={{ uri: message.mediaUri }}
              style={{
                width: '100%',
                height: 180,
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing.md
              }}
              resizeMode="cover"
            />
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isMine ? 'rgba(255,255,255,0.18)' : theme.colors.backgroundAlt
              }}
            >
              <Ionicons
                name={mediaMeta.icon}
                size={20}
                color={isMine ? theme.colors.white : theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyBold" color={isMine ? theme.colors.white : theme.colors.textPrimary}>
                {mediaMeta.label}
              </AppText>
              {secondaryLine ? (
                <AppText
                  variant="micro"
                  color={isMine ? 'rgba(255,255,255,0.72)' : theme.colors.textMuted}
                >
                  {secondaryLine}
                </AppText>
              ) : null}
              {tertiaryLine ? (
                <AppText
                  variant="micro"
                  color={isMine ? 'rgba(255,255,255,0.72)' : theme.colors.textMuted}
                >
                  {tertiaryLine}
                </AppText>
              ) : null}
            </View>
          </View>
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
