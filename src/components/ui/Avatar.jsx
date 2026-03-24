import React from 'react';
import { Image, View } from 'react-native';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';

const Avatar = ({
  uri,
  size = 44,
  label,
  online,
  premium
}) => {
  const theme = useTheme();

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong
          }}
        />
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
