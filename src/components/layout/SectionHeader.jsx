import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';

const SectionHeader = ({
  title,
  actionLabel,
  onPress
}) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.spacing.md
      }}
    >
      <AppText variant="section">{title}</AppText>
      {actionLabel ? (
        <Button variant="ghost" size="sm" onPress={onPress}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
};

export default SectionHeader;
