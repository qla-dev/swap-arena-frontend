import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/app/ThemeProvider';

const ScreenContainer = ({
  children,
  scroll = false,
  noPadding = false,
  style,
  contentContainerStyle,
  keyboard = false
}) => {
  const theme = useTheme();
  const body = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        {
          paddingHorizontal: noPadding ? 0 : theme.spacing.lg,
          paddingBottom: theme.spacing.huge * 2,
          gap: theme.spacing.lg
        },
        contentContainerStyle
      ]}
      style={{ flex: 1 }}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        {
          flex: 1,
          paddingHorizontal: noPadding ? 0 : theme.spacing.lg
        },
        contentContainerStyle
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}>
      {keyboard ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
};

export default ScreenContainer;
