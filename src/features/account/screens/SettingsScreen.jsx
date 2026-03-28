import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import SheetModal from '@/components/ui/SheetModal';
import useAuthStore from '@/store/authStore';

const APP_VERSION = '1.0.0';

const SettingItem = ({ icon, label, value, onPress, danger, isLast }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        minHeight: 82,
        backgroundColor: pressed ? theme.colors.backgroundAlt : theme.colors.surface,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.colors.border
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
        <Ionicons
          name={icon}
          size={20}
          color={danger ? theme.colors.danger : theme.colors.primary}
        />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <AppText
          variant="card"
          color={danger ? theme.colors.danger : theme.colors.textPrimary}
          numberOfLines={1}
        >
          {label}
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary} numberOfLines={1}>
          {value}
        </AppText>
      </View>

      <Ionicons
        name="chevron-forward-outline"
        size={18}
        color={danger ? theme.colors.danger : theme.colors.textMuted}
      />
    </Pressable>
  );
};

const SettingsSection = ({ title, items, onPressItem }) => {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <AppText variant="caption" color={theme.colors.textMuted}>
        {title}
      </AppText>
      <View
        style={{
          borderRadius: theme.radius.xxl,
          overflow: 'hidden',
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border
        }}
      >
        {items.map((item, index) => (
          <SettingItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            value={item.value}
            onPress={() => onPressItem(item.key)}
            danger={item.danger}
            isLast={index === items.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const OptionRow = ({ label, description, selected, onPress }) => {
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
        backgroundColor: selected ? theme.colors.backgroundAlt : theme.colors.surface,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        opacity: pressed ? 0.88 : 1
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="card">{label}</AppText>
        <AppText variant="body" color={theme.colors.textSecondary}>
          {description}
        </AppText>
      </View>
      {selected ? (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="checkmark" size={14} color={theme.colors.white} />
        </View>
      ) : (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong
          }}
        />
      )}
    </Pressable>
  );
};

const InfoPanel = ({ icon, title, description }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.sm
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
        <AppText variant="card">{title}</AppText>
      </View>
      <AppText variant="body" color={theme.colors.textSecondary}>
        {description}
      </AppText>
    </View>
  );
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const themeMode = useAuthStore((state) => state.themeMode);
  const notificationsEnabled = useAuthStore((state) => state.notificationsEnabled);
  const privacyMode = useAuthStore((state) => state.privacyMode);
  const language = useAuthStore((state) => state.language);
  const securityMode = useAuthStore((state) => state.securityMode);
  const blockedUsers = useAuthStore((state) => state.blockedUsers);
  const setThemeMode = useAuthStore((state) => state.setThemeMode);
  const setNotificationsEnabled = useAuthStore((state) => state.setNotificationsEnabled);
  const setPrivacyMode = useAuthStore((state) => state.setPrivacyMode);
  const setLanguage = useAuthStore((state) => state.setLanguage);
  const setSecurityMode = useAuthStore((state) => state.setSecurityMode);
  const logout = useAuthStore((state) => state.logout);
  const [activeSheet, setActiveSheet] = useState(null);

  const sections = useMemo(() => ([
    {
      title: 'Preferences',
      items: [
        {
          key: 'notifications',
          icon: 'notifications-outline',
          label: 'Notifications',
          value: notificationsEnabled ? 'Push alerts on' : 'Push alerts off'
        },
        {
          key: 'privacy',
          icon: 'eye-outline',
          label: 'Privacy',
          value: `${privacyMode} profile`
        },
        {
          key: 'security',
          icon: 'shield-checkmark-outline',
          label: 'Security',
          value: securityMode === 'Extra Secure' ? 'Extra secure mode' : 'Standard protection'
        },
        {
          key: 'language',
          icon: 'language-outline',
          label: 'Language',
          value: language
        },
        {
          key: 'appearance',
          icon: 'color-palette-outline',
          label: 'Appearance',
          value: themeMode === 'dark' ? 'Dark theme' : 'Light theme'
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          key: 'help',
          icon: 'help-circle-outline',
          label: 'Help Center',
          value: 'Support and FAQs'
        },
        {
          key: 'about',
          icon: 'information-circle-outline',
          label: 'About',
          value: `Version ${APP_VERSION}`
        },
        {
          key: 'legal',
          icon: 'document-text-outline',
          label: 'Terms & Privacy',
          value: 'Policies and legal'
        }
      ]
    },
    {
      title: 'Safety',
      items: [
        {
          key: 'blocked',
          icon: 'ban-outline',
          label: 'Blocked Users',
          value: blockedUsers.length ? `${blockedUsers.length} blocked` : 'No blocked users'
        }
      ]
    },
    {
      title: 'Session',
      items: [
        {
          key: 'logout',
          icon: 'log-out-outline',
          label: 'Logout',
          value: 'Sign out from this device',
          danger: true
        }
      ]
    }
  ]), [blockedUsers.length, language, notificationsEnabled, privacyMode, securityMode, themeMode]);

  const closeSheet = () => {
    setActiveSheet(null);
  };

  const handlePressItem = (key) => {
    setActiveSheet(key);
  };

  const renderSheet = () => {
    switch (activeSheet) {
      case 'notifications':
        return {
          title: 'Notifications',
          description: 'Choose how SwapArena should keep you updated.',
          body: (
            <View style={{ gap: theme.spacing.md }}>
              <OptionRow
                label="Enabled"
                description="Receive push alerts for messages, offers, and activity."
                selected={notificationsEnabled}
                onPress={async () => {
                  await setNotificationsEnabled(true);
                  closeSheet();
                }}
              />
              <OptionRow
                label="Muted"
                description="Pause push alerts while keeping in-app updates visible."
                selected={!notificationsEnabled}
                onPress={async () => {
                  await setNotificationsEnabled(false);
                  closeSheet();
                }}
              />
            </View>
          )
        };
      case 'privacy':
        return {
          title: 'Privacy',
          description: 'Control who can discover your profile and activity.',
          body: (
            <View style={{ gap: theme.spacing.md }}>
              {[
                {
                  label: 'Public',
                  description: 'Anyone on SwapArena can view your profile.'
                },
                {
                  label: 'Friends Only',
                  description: 'Keep your profile visible to trusted connections only.'
                },
                {
                  label: 'Private',
                  description: 'Hide your profile details unless you share them directly.'
                }
              ].map((option) => (
                <OptionRow
                  key={option.label}
                  label={option.label}
                  description={option.description}
                  selected={privacyMode === option.label}
                  onPress={async () => {
                    await setPrivacyMode(option.label);
                    closeSheet();
                  }}
                />
              ))}
            </View>
          )
        };
      case 'security':
        return {
          title: 'Security',
          description: 'Choose the protection level that fits this device.',
          body: (
            <View style={{ gap: theme.spacing.md }}>
              {[
                {
                  label: 'Standard',
                  description: 'Use your current sign-in flow with account activity alerts.'
                },
                {
                  label: 'Extra Secure',
                  description: 'Favor stronger checks and tighter sign-in protection.'
                }
              ].map((option) => (
                <OptionRow
                  key={option.label}
                  label={option.label}
                  description={option.description}
                  selected={securityMode === option.label}
                  onPress={async () => {
                    await setSecurityMode(option.label);
                    closeSheet();
                  }}
                />
              ))}
            </View>
          )
        };
      case 'language':
        return {
          title: 'Language',
          description: 'Pick the language you want to use in the app.',
          body: (
            <View style={{ gap: theme.spacing.md }}>
              {[
                {
                  label: 'English',
                  description: 'Use the default English app copy.'
                },
                {
                  label: 'Bosanski',
                  description: 'Switch menus and labels to Bosnian.'
                }
              ].map((option) => (
                <OptionRow
                  key={option.label}
                  label={option.label}
                  description={option.description}
                  selected={language === option.label}
                  onPress={async () => {
                    await setLanguage(option.label);
                    closeSheet();
                  }}
                />
              ))}
            </View>
          )
        };
      case 'appearance':
        return {
          title: 'Appearance',
          description: 'Switch the app look without leaving settings.',
          body: (
            <View style={{ gap: theme.spacing.md }}>
              <OptionRow
                label="Dark"
                description="Use the current darker arena theme."
                selected={themeMode === 'dark'}
                onPress={async () => {
                  await setThemeMode('dark');
                  closeSheet();
                }}
              />
              <OptionRow
                label="Light"
                description="Use the brighter app theme."
                selected={themeMode === 'light'}
                onPress={async () => {
                  await setThemeMode('light');
                  closeSheet();
                }}
              />
            </View>
          )
        };
      case 'help':
        return {
          title: 'Help Center',
          description: 'Find quick answers for the parts of the app you use most.',
          body: (
            <View style={{ gap: theme.spacing.md }}>
              <InfoPanel
                icon="chatbubble-ellipses-outline"
                title="Messaging Help"
                description="Get guidance for offers, negotiation, and chat safety."
              />
              <InfoPanel
                icon="pricetag-outline"
                title="Listing Help"
                description="Review posting tips, saved offers, and wishlist behavior."
              />
              <InfoPanel
                icon="card-outline"
                title="Transaction Help"
                description="Learn how purchase tracking and seller sales history work."
              />
            </View>
          )
        };
      case 'about':
        return {
          title: 'About SwapArena',
          description: 'A quick look at the app you are using right now.',
          body: (
            <View style={{ gap: theme.spacing.md }}>
              <InfoPanel
                icon="phone-portrait-outline"
                title="SwapArena Mobile"
                description={`Version ${APP_VERSION} keeps listings, chats, saved offers, and account tools in one place.`}
              />
              <InfoPanel
                icon="sparkles-outline"
                title="Built For Trading"
                description="SwapArena helps players browse deals, negotiate in chat, and manage their personal storefront."
              />
            </View>
          )
        };
      case 'legal':
        return {
          title: 'Terms & Privacy',
          description: 'Review how the app handles marketplace rules and personal data.',
          body: (
            <View style={{ gap: theme.spacing.md }}>
              <InfoPanel
                icon="document-outline"
                title="Terms of Use"
                description="Marketplace participation, acceptable use, and transaction expectations live here."
              />
              <InfoPanel
                icon="shield-outline"
                title="Privacy Policy"
                description="Privacy details cover account data, chat activity, and in-app preference storage."
              />
            </View>
          )
        };
      case 'blocked':
        return {
          title: 'Blocked Users',
          description: 'Accounts you block will appear here for quick review.',
          body: blockedUsers.length ? (
            <View style={{ gap: theme.spacing.md }}>
              {blockedUsers.map((name) => (
                <InfoPanel
                  key={name}
                  icon="person-circle-outline"
                  title={name}
                  description="This account is currently blocked."
                />
              ))}
            </View>
          ) : (
            <View
              style={{
                padding: theme.spacing.xxl,
                borderRadius: theme.radius.xxl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                gap: theme.spacing.sm
              }}
            >
              <AppText variant="section">No blocked users</AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                If you block someone from chat details, they will show up here.
              </AppText>
            </View>
          )
        };
      case 'logout':
        return {
          title: 'Logout',
          description: 'Sign out of SwapArena on this device?',
          body: (
            <View
              style={{
                padding: theme.spacing.lg,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                gap: theme.spacing.sm
              }}
            >
              <AppText variant="card">You can sign back in anytime.</AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Your saved preferences will still be available when you return.
              </AppText>
            </View>
          ),
          footer: (
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <Button variant="secondary" style={{ flex: 1 }} onPress={closeSheet}>
                Cancel
              </Button>
              <Button
                variant="danger"
                style={{ flex: 1 }}
                onPress={async () => {
                  closeSheet();
                  await logout();
                }}
              >
                Logout
              </Button>
            </View>
          )
        };
      default:
        return null;
    }
  };

  const activeSheetConfig = renderSheet();

  return (
    <>
      <ScreenContainer scroll contentContainerStyle={{ paddingTop: theme.spacing.xl }}>
        <View style={{ gap: theme.spacing.xxl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
            </Button>
            <AppText variant="page">Settings</AppText>
          </View>

          {sections.map((section) => (
            <SettingsSection
              key={section.title}
              title={section.title}
              items={section.items}
              onPressItem={handlePressItem}
            />
          ))}
        </View>
      </ScreenContainer>

      <SheetModal
        visible={Boolean(activeSheetConfig)}
        onClose={closeSheet}
        title={activeSheetConfig?.title}
        description={activeSheetConfig?.description}
        footer={activeSheetConfig?.footer || (
          <Button variant="secondary" onPress={closeSheet}>
            Close
          </Button>
        )}
      >
        {activeSheetConfig?.body}
      </SheetModal>
    </>
  );
};

export default SettingsScreen;
