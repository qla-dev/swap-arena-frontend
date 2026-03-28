import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/app/ThemeProvider';
import Avatar from '@/components/ui/Avatar';
import AppText from '@/components/ui/AppText';

const StoryBubble = ({
  story,
  onPress
}) => {
  const theme = useTheme();
  const ringColor = story.isSelf
    ? theme.colors.primary
    : story.isSeen
      ? theme.colors.borderStrong
      : theme.colors.warning;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 82,
        opacity: pressed ? 0.8 : 1,
        gap: theme.spacing.sm,
        alignItems: 'center'
      })}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          padding: 3,
          backgroundColor: ringColor,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {story.isSelf ? (
          <View
            style={{
              width: 66,
              height: 66,
              borderRadius: 33,
              backgroundColor: theme.colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.borderStrong
            }}
          >
            <Avatar
              uri={story.avatar}
              avatarConfig={story.avatarConfig}
              label={story.username}
              size={62}
            />
            <View
              style={{
                position: 'absolute',
                right: 3,
                bottom: 3,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: theme.colors.surface
              }}
            >
              <Ionicons name="add" size={14} color={theme.colors.white} />
            </View>
          </View>
        ) : (
          <View
            style={{
              width: 66,
              height: 66,
              borderRadius: 33,
              borderWidth: 2,
              borderColor: theme.colors.background,
              overflow: 'hidden'
            }}
          >
            <Avatar
              uri={story.avatar}
              avatarConfig={story.avatarConfig}
              label={story.username}
              size={66}
            />
          </View>
        )}
      </View>
      <AppText
        variant="micro"
        color={theme.colors.textSecondary}
        numberOfLines={1}
        style={{ maxWidth: 76, textAlign: 'center' }}
      >
        {story.isSelf ? 'Your Story' : story.username}
      </AppText>
    </Pressable>
  );
};

export default React.memo(StoryBubble);
