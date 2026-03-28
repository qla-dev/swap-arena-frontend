import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';

const SheetModal = ({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  contentStyle,
  showCloseButton = true,
  animationType = 'fade'
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: theme.colors.overlay,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: Math.max(insets.top, theme.spacing.lg),
            paddingBottom: Math.max(insets.bottom, theme.spacing.lg)
          }}
        >
          <Pressable
            onPress={onClose}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />

          <View
            style={[
              {
                maxHeight: '100%',
                backgroundColor: theme.colors.background,
                borderRadius: theme.radius.xxl,
                borderWidth: 1,
                borderColor: theme.colors.borderStrong,
                paddingHorizontal: theme.spacing.xxl,
                paddingTop: theme.spacing.xxl,
                paddingBottom: theme.spacing.xxl,
                gap: theme.spacing.lg
              },
              theme.shadows.floating,
              contentStyle
            ]}
          >
            {title || description || showCloseButton ? (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
                <View style={{ flex: 1, gap: description ? theme.spacing.xs : 0 }}>
                  {title ? <AppText variant="section">{title}</AppText> : null}
                  {description ? (
                    <AppText variant="body" color={theme.colors.textSecondary}>
                      {description}
                    </AppText>
                  ) : null}
                </View>

                {showCloseButton ? (
                  <Pressable
                    onPress={onClose}
                    style={({ pressed }) => ({
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      opacity: pressed ? 0.82 : 1
                    })}
                  >
                    <Ionicons name="close" size={18} color={theme.colors.textPrimary} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            <ScrollView
              style={{ flexGrow: 0, flexShrink: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: theme.spacing.lg }}
            >
              {children}
            </ScrollView>

            {footer}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SheetModal;
