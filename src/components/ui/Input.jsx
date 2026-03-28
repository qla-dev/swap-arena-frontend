import React from 'react';
import { TextInput, View } from 'react-native';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';

const Input = React.forwardRef(({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  keyboardType,
  autoCapitalize = 'none',
  left,
  right,
  style,
  inputStyle,
  helperText
}, ref) => {
  const theme = useTheme();

  return (
    <View style={[{ gap: theme.spacing.sm }, style]}>
      {label ? (
        <AppText variant="caption" color={theme.colors.textMuted}>
          {label}
        </AppText>
      ) : null}
      <View
        style={{
          minHeight: multiline ? 120 : 52,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.borderStrong,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: multiline ? theme.spacing.lg : 0,
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: theme.spacing.md
        }}
      >
        {left ? <View style={{ marginTop: multiline ? 2 : 0 }}>{left}</View> : null}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            {
              flex: 1,
              color: theme.colors.textPrimary,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
              minHeight: multiline ? 92 : undefined,
              textAlignVertical: multiline ? 'top' : 'center'
            },
            inputStyle
          ]}
        />
        {right ? <View style={{ marginTop: multiline ? 2 : 0 }}>{right}</View> : null}
      </View>
      {helperText ? (
        <AppText variant="micro" color={theme.colors.textSecondary}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;
