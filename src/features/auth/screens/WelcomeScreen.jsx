import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/authStore';

const highlights = [
  { icon: 'play-circle-outline', title: 'Stories', description: 'Flash deals, swaps, and temporary highlights from gamers nearby.' },
  { icon: 'compass-outline', title: 'Discovery', description: 'Swipe through platform-aware listings without duplicate cards.' },
  { icon: 'chatbubble-ellipses-outline', title: 'Negotiation', description: 'Real-time chat, offers, and automatic transaction tracking.' }
];

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const completeWelcome = useAuthStore((state) => state.completeWelcome);
  const theme = useTheme();

  const handleContinue = async () => {
    await completeWelcome();
    navigation.replace('Login');
  };

  return (
    <ScreenContainer scroll contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
      <View style={{ gap: theme.spacing.xxl }}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={{
            minHeight: 260,
            borderRadius: theme.radius.xxl,
            padding: theme.spacing.xxl,
            justifyContent: 'space-between'
          }}
        >
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="logo" color={theme.colors.white}>
              SwapArena
            </AppText>
            <AppText variant="page" color={theme.colors.white} style={{ maxWidth: 260 }}>
              Buy, sell, swap, and negotiate like the web experience, rebuilt for mobile.
            </AppText>
          </View>
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.pill, backgroundColor: 'rgba(255,255,255,0.16)' }}>
            <AppText variant="caption" color={theme.colors.white}>
              Marketplace for games and gear
            </AppText>
          </View>
        </LinearGradient>

        <View style={{ gap: theme.spacing.lg }}>
          {highlights.map((item) => (
            <View
              key={item.title}
              style={{
                flexDirection: 'row',
                gap: theme.spacing.lg,
                padding: theme.spacing.lg,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.xl
              }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: theme.colors.backgroundAlt,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, gap: theme.spacing.xs }}>
                <AppText variant="card">{item.title}</AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {item.description}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <Button variant="primary" size="lg" onPress={handleContinue}>
          Continue
        </Button>
        <Button variant="secondary" size="lg" onPress={() => navigation.replace('Login')}>
          I Already Have An Account
        </Button>
      </View>
    </ScreenContainer>
  );
};

export default WelcomeScreen;
