import React, { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ListingCard from '@/components/cards/ListingCard';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Avatar from '@/components/ui/Avatar';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/authStore';
import useListingStore from '@/store/listingStore';
import usePremiumStore from '@/store/premiumStore';
import { formatDateTime } from '@/utils/formatters';

const QuickButton = ({ label, icon, onPress }) => {
  const theme = useTheme();

  return (
    <Button
      variant="secondary"
      size="sm"
      onPress={onPress}
      left={<Ionicons name={icon} size={16} color={theme.colors.textPrimary} />}
      style={{ flex: 1 }}
    >
      {label}
    </Button>
  );
};

const AccountScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const listings = useListingStore((state) => state.listings);
  const wishlistIds = useListingStore((state) => state.wishlistIds);
  const savedOfferIds = useListingStore((state) => state.savedOfferIds);
  const myStoreListingIds = useListingStore((state) => state.myStoreListingIds);
  const toggleWishlist = useListingStore((state) => state.toggleWishlist);
  const isPremium = usePremiumStore((state) => state.isPremium);
  const premiumUntil = usePremiumStore((state) => state.premiumUntil);

  const myListings = useMemo(
    () => listings.filter((item) => myStoreListingIds.includes(item.id) && item.status === 'active'),
    [listings, myStoreListingIds]
  );
  const savedOffers = useMemo(
    () => listings.filter((item) => savedOfferIds.includes(item.id)),
    [listings, savedOfferIds]
  );

  if (!user) {
    return null;
  }

  return (
    <ScreenContainer scroll>
      <View style={{ gap: theme.spacing.xxl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <AppText variant="page">Account</AppText>
          <Button
            variant="secondary"
            size="icon"
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={20} color={theme.colors.textPrimary} />
          </Button>
        </View>

        <View
          style={{
            padding: theme.spacing.xxl,
            borderRadius: theme.radius.xxl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            gap: theme.spacing.lg
          }}
        >
          <View style={{ flexDirection: 'row', gap: theme.spacing.lg, alignItems: 'center' }}>
            <Avatar
              uri={user.avatar}
              label={user.name}
              size={84}
              premium={isPremium}
            />
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <AppText variant="section">{user.name}</AppText>
                {user.verified ? (
                  <Ionicons name="shield-checkmark" size={16} color={theme.colors.info} />
                ) : null}
                {isPremium ? (
                  <Ionicons name="flash" size={16} color={theme.colors.warning} />
                ) : null}
              </View>
              <AppText variant="body" color={theme.colors.textSecondary}>
                {user.username} - {user.location}
              </AppText>
              <AppText variant="micro" color={theme.colors.textMuted}>
                {user.rating} rating - {user.ratingCount} reviews
              </AppText>
              {isPremium ? (
                <AppText variant="micro" color={theme.colors.warning}>
                  Premium active until {formatDateTime(premiumUntil)}
                </AppText>
              ) : null}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <QuickButton label="Wishlist" icon="heart-outline" onPress={() => navigation.navigate('Wishlist')} />
            <QuickButton label="Sales" icon="cash-outline" onPress={() => navigation.navigate('SalesHistory')} />
            <QuickButton label="Premium" icon="flash-outline" onPress={() => navigation.navigate('Premium')} />
          </View>
        </View>

        {!isPremium ? (
          <Pressable
            onPress={() => navigation.navigate('Premium')}
            style={({ pressed }) => ({
              padding: theme.spacing.xxl,
              borderRadius: theme.radius.xxl,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.warning,
              gap: theme.spacing.sm,
              opacity: pressed ? 0.88 : 1
            })}
          >
            <AppText variant="section">Go Premium</AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Unlock unlimited wishlist items, boosted listings, premium badge, and analytics.
            </AppText>
          </Pressable>
        ) : null}

        <View style={{ gap: theme.spacing.lg }}>
          <AppText variant="section">My Listings</AppText>
          <FlatList
            horizontal
            data={myListings}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: theme.spacing.md }}
            renderItem={({ item }) => (
              <ListingCard
                listing={item}
                horizontal
                isWishlisted={wishlistIds.includes(item.id)}
                onToggleWishlist={() => toggleWishlist(item.id)}
                onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
              />
            )}
          />
        </View>

        <View style={{ gap: theme.spacing.lg }}>
          <AppText variant="section">Saved Offers</AppText>
          {savedOffers.length ? (
            <FlatList
              horizontal
              data={savedOffers}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: theme.spacing.md }}
              renderItem={({ item }) => (
                <ListingCard
                  listing={item}
                  horizontal
                  isWishlisted={wishlistIds.includes(item.id)}
                  onToggleWishlist={() => toggleWishlist(item.id)}
                  onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
                />
              )}
            />
          ) : (
            <View
              style={{
                padding: theme.spacing.xxl,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}
            >
              <AppText variant="body" color={theme.colors.textSecondary}>
                Save interesting offers from listing detail pages to revisit them here.
              </AppText>
            </View>
          )}
        </View>

        <View style={{ gap: theme.spacing.lg }}>
          <AppText variant="section">Latest Reviews</AppText>
          {user.reviews.map((review) => (
            <View
              key={review.id}
              style={{
                padding: theme.spacing.lg,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                gap: theme.spacing.sm
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
                <AppText variant="card">{review.reviewerName}</AppText>
                <AppText variant="micro" color={theme.colors.warning}>
                  {review.rating}/5
                </AppText>
              </View>
              <AppText variant="body" color={theme.colors.textSecondary}>
                {review.comment}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};

export default AccountScreen;
