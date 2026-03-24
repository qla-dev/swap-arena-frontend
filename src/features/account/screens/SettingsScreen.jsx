import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/authStore';

const SettingItem = ({ icon, label, value, onPress }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        opacity: pressed ? 0.88 : 1
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.backgroundAlt
        }}
      >
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="card">{label}</AppText>
        {value ? (
          <AppText variant="body" color={theme.colors.textSecondary}>
            {value}
          </AppText>
        ) : null}
      </View>
      <Ionicons name="chevron-forward-outline" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const themeMode = useAuthStore((state) => state.themeMode);
  const setThemeMode = useAuthStore((state) => state.setThemeMode);
  const logout = useAuthStore((state) => state.logout);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacy, setPrivacy] = useState('Public');

  return (
    <ScreenContainer scroll>
      <View style={{ gap: theme.spacing.xxl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
          </Button>
          <AppText variant="page">Settings</AppText>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SettingItem
            icon="moon-outline"
            label="Theme"
            value={themeMode === 'dark' ? 'Dark mode' : 'Light mode'}
            onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          />
          <SettingItem
            icon="notifications-outline"
            label="Notifications"
            value={notificationsEnabled ? 'Push enabled' : 'Push muted'}
            onPress={() => setNotificationsEnabled((current) => !current)}
          />
          <SettingItem
            icon="lock-closed-outline"
            label="Privacy"
            value={privacy}
            onPress={() => setPrivacy((current) => (current === 'Public' ? 'Friends Only' : 'Public'))}
          />
          <SettingItem
            icon="help-circle-outline"
            label="Help Center"
            value="Marketplace, chat, and transaction support"
            onPress={() => null}
          />
        </View>

        <Button variant="danger" size="lg" onPress={logout}>
          Log Out
        </Button>
      </View>
    </ScreenContainer>
  );
};

export default SettingsScreen;
