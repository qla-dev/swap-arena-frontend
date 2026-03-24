import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';

const Badge = ({
  label,
  tone = 'default',
  style,
  textStyle
}) => {
  const theme = useTheme();
  const palette = {
    default: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.textSecondary,
      borderColor: theme.colors.border
    },
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      borderColor: theme.colors.primary
    },
    success: {
      backgroundColor: theme.colors.success,
      color: theme.colors.white,
      borderColor: theme.colors.success
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: theme.colors.white,
      borderColor: theme.colors.danger
    },
    warning: {
      backgroundColor: theme.colors.warning,
      color: theme.colors.white,
      borderColor: theme.colors.warning
    }
  }[tone] || {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textSecondary,
    borderColor: theme.colors.border
  };

  return (
    <View
      style={[
        {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          backgroundColor: palette.backgroundColor,
          borderWidth: 1,
          borderColor: palette.borderColor,
          alignSelf: 'flex-start'
        },
        style
      ]}
    >
      <AppText
        variant="micro"
        color={palette.color}
        style={textStyle}
      >
        {label}
      </AppText>
    </View>
  );
};

export default Badge;
