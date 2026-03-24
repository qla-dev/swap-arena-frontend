import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';

const EmptyState = ({
  title,
  description,
  actionLabel,
  onPress,
  icon
}) => {
  const theme = useTheme();

  return (
    <View
      style={{
        paddingVertical: theme.spacing.huge,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.lg
      }}
    >
      {icon ? icon : null}
      <View style={{ gap: theme.spacing.sm, alignItems: 'center' }}>
        <AppText variant="section" style={{ textAlign: 'center' }}>
          {title}
        </AppText>
        <AppText
          variant="body"
          color={theme.colors.textSecondary}
          style={{ textAlign: 'center', maxWidth: 280 }}
        >
          {description}
        </AppText>
      </View>
      {actionLabel ? (
        <Button variant="primary" onPress={onPress}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
};

export default EmptyState;
