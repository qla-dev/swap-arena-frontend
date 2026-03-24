import React, { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ListingCard from '@/components/cards/ListingCard';
import TransactionCard from '@/components/cards/TransactionCard';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import useListingStore from '@/store/listingStore';
import usePremiumStore from '@/store/premiumStore';

const QuickLink = ({ icon, label, description, onPress }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 116,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        gap: theme.spacing.sm,
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
      <AppText variant="card">{label}</AppText>
      <AppText variant="body" color={theme.colors.textSecondary}>
        {description}
      </AppText>
    </Pressable>
  );
};

const MyStoreScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const listings = useListingStore((state) => state.listings);
  const myStoreListingIds = useListingStore((state) => state.myStoreListingIds);
  const wishlistIds = useListingStore((state) => state.wishlistIds);
  const transactions = useListingStore((state) => state.transactions);
  const toggleWishlist = useListingStore((state) => state.toggleWishlist);
  const isPremium = usePremiumStore((state) => state.isPremium);

  const myListings = useMemo(
    () => listings.filter((item) => myStoreListingIds.includes(item.id) && item.status === 'active'),
    [listings, myStoreListingIds]
  );
  const sales = transactions.filter((item) => item.sellerName === 'Marcus V.');
  const purchases = transactions.filter((item) => item.buyerName === 'Marcus V.');
  const totalViews = myListings.reduce((total, item) => total + (item.viewsCount || 0), 0);
  const totalWishlist = myListings.reduce((total, item) => total + (item.wishlistCount || 0), 0);

  return (
    <ScreenContainer scroll>
      <View style={{ gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="page">My Store</AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Active listings, wishlist access, transaction history, and premium analytics.
          </AppText>
        </View>

        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <QuickLink
            icon="add-outline"
            label="Add Listing"
            description="Create a new marketplace offer."
            onPress={() => navigation.navigate('AddListing')}
          />
          <QuickLink
            icon="heart-outline"
            label="Wishlist"
            description="Open your saved listings."
            onPress={() => navigation.navigate('Wishlist')}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <QuickLink
            icon="cash-outline"
            label="Sales History"
            description={`${sales.length} tracked transactions`}
            onPress={() => navigation.navigate('SalesHistory')}
          />
          <QuickLink
            icon="bag-handle-outline"
            label="Purchase History"
            description={`${purchases.length} buyer records`}
            onPress={() => navigation.navigate('PurchaseHistory')}
          />
        </View>

        {isPremium ? (
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
            <AppText variant="section">Premium Analytics</AppText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="micro" color={theme.colors.textMuted}>
                  Views
                </AppText>
                <AppText variant="page" color={theme.colors.primary}>
                  {totalViews}
                </AppText>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="micro" color={theme.colors.textMuted}>
                  Wishlist Count
                </AppText>
                <AppText variant="page" color={theme.colors.primary}>
                  {totalWishlist}
                </AppText>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="micro" color={theme.colors.textMuted}>
                  Boosted
                </AppText>
                <AppText variant="page" color={theme.colors.primary}>
                  {myListings.filter((item) => item.isBoosted).length}
                </AppText>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              padding: theme.spacing.xxl,
              borderRadius: theme.radius.xxl,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              gap: theme.spacing.md
            }}
          >
            <AppText variant="section">Premium Analytics Locked</AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Upgrade to view listing views, wishlist counts, and boost performance for your store.
            </AppText>
            <Button variant="primary" onPress={() => navigation.navigate('Premium')}>
              Go Premium
            </Button>
          </View>
        )}

        <View style={{ gap: theme.spacing.lg }}>
          <AppText variant="section">Active Listings</AppText>
          {myListings.length ? (
            <FlatList
              data={myListings}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ gap: theme.spacing.md }}
              renderItem={({ item }) => (
                <ListingCard
                  listing={item}
                  isWishlisted={wishlistIds.includes(item.id)}
                  onToggleWishlist={() => toggleWishlist(item.id)}
                  onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
                />
              )}
            />
          ) : (
            <EmptyState
              title="No active listings"
              description="Create your first listing to start selling and tracking analytics."
              actionLabel="Add Listing"
              onPress={() => navigation.navigate('AddListing')}
            />
          )}
        </View>

        {sales.length ? (
          <View style={{ gap: theme.spacing.lg }}>
            <AppText variant="section">Recent Sales</AppText>
            <TransactionCard transaction={sales[0]} role="seller" />
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

export default MyStoreScreen;
