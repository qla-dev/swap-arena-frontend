import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';

const sizeStyles = {
  sm: { minHeight: 38, paddingHorizontal: 14, paddingVertical: 8 },
  md: { minHeight: 46, paddingHorizontal: 18, paddingVertical: 12 },
  lg: { minHeight: 54, paddingHorizontal: 20, paddingVertical: 15 },
  icon: { minHeight: 44, width: 44, paddingHorizontal: 0, paddingVertical: 0 }
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled,
  loading,
  style,
  textStyle,
  fullWidth,
  left,
  right
}) => {
  const theme = useTheme();
  const palette = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      textColor: theme.colors.white
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.borderStrong,
      textColor: theme.colors.textPrimary
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: theme.colors.textSecondary
    },
    danger: {
      backgroundColor: theme.colors.danger,
      borderColor: theme.colors.danger,
      textColor: theme.colors.white
    },
    pill: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      textColor: theme.colors.textSecondary
    }
  }[variant] || {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    textColor: theme.colors.white
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minWidth: size === 'icon' ? 44 : undefined,
          width: fullWidth ? '100%' : undefined,
          borderRadius: variant === 'pill' ? theme.radius.pill : theme.radius.md,
          backgroundColor: palette.backgroundColor,
          borderWidth: variant === 'ghost' ? 0 : 1,
          borderColor: palette.borderColor,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          opacity: disabled ? 0.48 : pressed ? 0.82 : 1,
          gap: theme.spacing.sm,
          ...(sizeStyles[size] || sizeStyles.md)
        },
        variant === 'primary' ? theme.shadows.primary : null,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.textColor} />
      ) : (
        <>
          {left ? <View>{left}</View> : null}
          {typeof children === 'string' ? (
            <AppText
              variant="bodyBold"
              color={palette.textColor}
              style={[{ textAlign: 'center' }, textStyle]}
            >
              {children}
            </AppText>
          ) : (
            children
          )}
          {right ? <View>{right}</View> : null}
        </>
      )}
    </Pressable>
  );
};

export default Button;
