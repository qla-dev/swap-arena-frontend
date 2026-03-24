import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import usePremiumStore from '@/store/premiumStore';
import { formatDateTime } from '@/utils/formatters';

const features = [
  'Unlimited wishlist capacity',
  'Boosted listings and priority placement',
  'Premium profile badge and analytics',
  'Early access to featured listings',
  'Priority alerts for saved items'
];

const PremiumScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const isPremium = usePremiumStore((state) => state.isPremium);
  const premiumUntil = usePremiumStore((state) => state.premiumUntil);
  const upgrade = usePremiumStore((state) => state.upgrade);

  return (
    <ScreenContainer scroll>
      <View style={{ gap: theme.spacing.xxl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
          </Button>
          <AppText variant="page">Premium</AppText>
        </View>

        <View
          style={{
            padding: theme.spacing.xxl,
            borderRadius: theme.radius.xxl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.warning,
            gap: theme.spacing.lg
          }}
        >
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              backgroundColor: 'rgba(245,158,11,0.18)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="flash" size={32} color={theme.colors.warning} />
          </View>
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="page">{isPremium ? 'Premium Active' : 'Unlock Premium'}</AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Premium directly changes marketplace behavior: unlimited wishlist slots, boosts, analytics, and early featured inventory.
            </AppText>
          </View>
          {isPremium ? (
            <AppText variant="bodyBold" color={theme.colors.warning}>
              Active until {formatDateTime(premiumUntil)}
            </AppText>
          ) : (
            <Button variant="primary" size="lg" onPress={upgrade}>
              Upgrade Now
            </Button>
          )}
        </View>

        <View style={{ gap: theme.spacing.md }}>
          {features.map((feature) => (
            <View
              key={feature}
              style={{
                flexDirection: 'row',
                gap: theme.spacing.md,
                padding: theme.spacing.lg,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <AppText variant="body" style={{ flex: 1 }}>
                {feature}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};

export default PremiumScreen;
