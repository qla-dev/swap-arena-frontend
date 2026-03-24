import React, { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ListingCard from '@/components/cards/ListingCard';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import useListingStore from '@/store/listingStore';
import usePremiumStore from '@/store/premiumStore';

const WishlistScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const listings = useListingStore((state) => state.listings);
  const wishlistIds = useListingStore((state) => state.wishlistIds);
  const toggleWishlist = useListingStore((state) => state.toggleWishlist);
  const isPremium = usePremiumStore((state) => state.isPremium);
  const wishlistLimit = usePremiumStore((state) => state.wishlistLimit);

  const wishlist = useMemo(
    () => listings.filter((item) => wishlistIds.includes(item.id) && item.status === 'active'),
    [listings, wishlistIds]
  );

  return (
    <ScreenContainer scroll>
      <View style={{ gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="page">Wishlist</AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Server-modeled saved listings with premium-aware capacity.
          </AppText>
          <AppText variant="micro" color={theme.colors.textMuted}>
            {isPremium ? 'Unlimited capacity' : `${wishlist.length}/${wishlistLimit} slots used`}
          </AppText>
        </View>

        {!isPremium ? (
          <View
            style={{
              padding: theme.spacing.lg,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              gap: theme.spacing.md
            }}
          >
            <AppText variant="card">Need more wishlist space?</AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Premium unlocks unlimited saved listings, price-drop alerts, and boosted placement.
            </AppText>
            <Button variant="primary" onPress={() => navigation.navigate('Premium')}>
              Upgrade To Premium
            </Button>
          </View>
        ) : null}

        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ gap: theme.spacing.md }}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              isWishlisted
              onToggleWishlist={() => toggleWishlist(item.id)}
              onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="Wishlist is empty"
              description="Swipe right in Discovery or tap hearts on listings to save them here."
              actionLabel="Go To Discovery"
              onPress={() => navigation.navigate('Main', { tab: 'Discovery' })}
            />
          }
        />
      </View>
    </ScreenContainer>
  );
};

export default WishlistScreen;
