import React from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';

const Avatar = ({
  uri,
  avatarConfig,
  size = 44,
  label,
  online,
  premium
}) => {
  const theme = useTheme();
  const imageUri = avatarConfig?.type === 'image' ? avatarConfig.uri : uri;
  const generatedAvatar = avatarConfig?.type === 'generated' ? avatarConfig : null;
  const generatedColor = generatedAvatar?.backgroundColorKey
    ? theme.colors[generatedAvatar.backgroundColorKey] || theme.colors.primary
    : generatedAvatar?.backgroundColor || theme.colors.primary;
  const generatedInitials = String(generatedAvatar?.initials || label || '?')
    .slice(0, 2)
    .toUpperCase();
  const generatedTextStyle = size >= 80
    ? { fontSize: 26, lineHeight: 28 }
    : size >= 60
      ? { fontSize: 18, lineHeight: 20 }
      : size >= 44
        ? { fontSize: 14, lineHeight: 16 }
        : { fontSize: 11, lineHeight: 13 };
  const iconBadgeSize = Math.max(18, Math.round(size * 0.3));
  const iconSize = Math.max(10, Math.round(iconBadgeSize * 0.52));

  return (
    <View style={{ width: size, height: size }}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong
          }}
        />
      ) : generatedAvatar ? (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: generatedColor,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.borderStrong
          }}
        >
          <AppText
            variant="bodyBold"
            color={theme.colors.white}
            style={generatedTextStyle}
          >
            {generatedInitials}
          </AppText>
          {generatedAvatar.icon ? (
            <View
              style={{
                position: 'absolute',
                right: Math.max(0, Math.round(size * 0.04)),
                bottom: Math.max(0, Math.round(size * 0.04)),
                width: iconBadgeSize,
                height: iconBadgeSize,
                borderRadius: iconBadgeSize / 2,
                backgroundColor: theme.colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.borderStrong
              }}
            >
              <Ionicons name={generatedAvatar.icon} size={iconSize} color={generatedColor} />
            </View>
          ) : null}
        </View>
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <AppText variant="bodyBold" color={theme.colors.white}>
            {(label || '?').slice(0, 1).toUpperCase()}
          </AppText>
        </View>
      )}
      {online ? (
        <View
          style={{
            position: 'absolute',
            right: 1,
            bottom: 1,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: theme.colors.success,
            borderWidth: 2,
            borderColor: theme.colors.background
          }}
        />
      ) : null}
      {premium ? (
        <View
          style={{
            position: 'absolute',
            left: -2,
            bottom: -2,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            paddingHorizontal: 4,
            backgroundColor: theme.colors.warning,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <AppText variant="micro" color={theme.colors.white}>
            PRO
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

export default Avatar;
