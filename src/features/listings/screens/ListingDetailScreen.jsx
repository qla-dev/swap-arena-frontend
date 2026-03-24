import React, { useMemo } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Share,
  useWindowDimensions,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import ScreenContainer from '@/components/layout/ScreenContainer';
import useAuthStore from '@/store/authStore';
import useChatStore from '@/store/chatStore';
import useListingStore from '@/store/listingStore';
import {
  formatCurrency,
  formatRelativeTime
} from '@/utils/formatters';

const DetailMetric = ({ icon, label, value }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: '47%',
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.sm
      }}
    >
      <Ionicons name={icon} size={22} color={theme.colors.primary} />
      <AppText variant="micro" color={theme.colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="bodyBold">{value}</AppText>
    </View>
  );
};

const ListingDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const user = useAuthStore((state) => state.user);
  const listings = useListingStore((state) => state.listings);
  const wishlistIds = useListingStore((state) => state.wishlistIds);
  const savedOfferIds = useListingStore((state) => state.savedOfferIds);
  const toggleWishlist = useListingStore((state) => state.toggleWishlist);
  const toggleSavedOffer = useListingStore((state) => state.toggleSavedOffer);
  const removeListing = useListingStore((state) => state.removeListing);
  const createTransaction = useListingStore((state) => state.createTransaction);
  const ensureConversation = useChatStore((state) => state.ensureConversation);

  const listing = useMemo(
    () => listings.find((item) => item.id === route.params?.listingId),
    [listings, route.params?.listingId]
  );

  if (!listing) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.lg }}>
          <AppText variant="section">Listing unavailable</AppText>
          <Button variant="primary" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  const isMine = user?.id === listing.seller.id;
  const isWishlisted = wishlistIds.includes(listing.id);
  const isSaved = savedOfferIds.includes(listing.id);

  const handleToggleWishlist = () => {
    const result = toggleWishlist(listing.id);
    if (result && result.ok === false) {
      Alert.alert('Wishlist limit reached', result.message, [
        { text: 'Later', style: 'cancel' },
        { text: 'Go Premium', onPress: () => navigation.navigate('Premium') }
      ]);
    }
  };

  const handleShare = async () => {
    await Share.share({
      message: `Check out ${listing.title} on SwapArena for ${formatCurrency(listing.price)}`
    });
  };

  const openChat = () => {
    const conversationId = ensureConversation({
      participant: listing.seller,
      listingId: listing.id
    });

    navigation.navigate('ChatView', { conversationId });
  };

  const handleBuyNow = () => {
    createTransaction({
      listingId: listing.id,
      listingTitle: listing.title,
      imageUrl: listing.imageUrl,
      buyerName: user?.name || 'Marcus V.',
      sellerName: listing.seller.name,
      agreedPrice: listing.price,
      status: 'accepted'
    });
    Alert.alert('Purchase tracked', `${listing.title} was added to your transaction history.`);
    navigation.navigate('PurchaseHistory');
  };

  return (
    <ScreenContainer noPadding>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 132 }}
      >
        <View style={{ position: 'relative' }}>
          <FlatList
            horizontal
            pagingEnabled
            data={listing.images}
            keyExtractor={(item, index) => `${listing.id}-${index}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width, height: 380, backgroundColor: theme.colors.backgroundAlt }}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
          <View
            style={{
              position: 'absolute',
              top: theme.spacing.huge + theme.spacing.sm,
              left: theme.spacing.lg,
              right: theme.spacing.lg,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Button variant="secondary" size="icon" onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={20} color={theme.colors.textPrimary} />
            </Button>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <Button variant={isSaved ? 'primary' : 'secondary'} size="icon" onPress={() => toggleSavedOffer(listing.id)}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={isSaved ? theme.colors.white : theme.colors.textPrimary}
                />
              </Button>
              <Button variant="secondary" size="icon" onPress={handleShare}>
                <Ionicons name="share-social-outline" size={18} color={theme.colors.textPrimary} />
              </Button>
            </View>
          </View>
          <View style={{ position: 'absolute', left: theme.spacing.lg, bottom: theme.spacing.lg, gap: theme.spacing.sm }}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
              {listing.platform.map((platform) => (
                <Badge key={`${listing.id}-${platform}`} label={platform} />
              ))}
              {listing.isBoosted ? <Badge label="Boosted" tone="warning" /> : null}
              {listing.listingType === 'trade' ? <Badge label="Swap" tone="primary" /> : <Badge label="Sale" tone="success" />}
            </View>
          </View>
        </View>

        <View style={{ padding: theme.spacing.xxl, gap: theme.spacing.xxl }}>
          <View style={{ gap: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.lg }}>
              <View style={{ flex: 1, gap: theme.spacing.sm }}>
                <AppText variant="hero">{listing.title}</AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  {listing.description}
                </AppText>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <AppText variant="page" color={theme.colors.primary}>
                  {formatCurrency(listing.price)}
                </AppText>
                {listing.discount ? (
                  <AppText variant="micro" color={theme.colors.danger}>
                    -{listing.discount}% off
                  </AppText>
                ) : null}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <Button
                variant={isWishlisted ? 'primary' : 'secondary'}
                style={{ flex: 1 }}
                onPress={handleToggleWishlist}
                left={
                  <Ionicons
                    name={isWishlisted ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isWishlisted ? theme.colors.white : theme.colors.textPrimary}
                  />
                }
              >
                Wishlist
              </Button>
              <Button
                variant={isSaved ? 'primary' : 'secondary'}
                style={{ flex: 1 }}
                onPress={() => toggleSavedOffer(listing.id)}
                left={
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={isSaved ? theme.colors.white : theme.colors.textPrimary}
                  />
                }
              >
                Save
              </Button>
            </View>
          </View>

          <Pressable
            onPress={openChat}
            style={({ pressed }) => ({
              flexDirection: 'row',
              gap: theme.spacing.md,
              padding: theme.spacing.lg,
              borderRadius: theme.radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              opacity: pressed ? 0.88 : 1
            })}
          >
            <Avatar
              uri={listing.seller.avatar}
              label={listing.seller.name}
              premium={listing.seller.isPremium}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <AppText variant="card">{listing.seller.name}</AppText>
                {listing.seller.verified ? (
                  <Ionicons name="shield-checkmark" size={14} color={theme.colors.info} />
                ) : null}
              </View>
              <AppText variant="body" color={theme.colors.textSecondary}>
                {listing.seller.bio}
              </AppText>
              <AppText variant="micro" color={theme.colors.textMuted}>
                {listing.seller.rating} rating - {listing.seller.ratingCount} reviews - {listing.seller.location}
              </AppText>
            </View>
            <Button variant="secondary" size="icon" onPress={openChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.textPrimary} />
            </Button>
          </Pressable>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            <DetailMetric icon="sparkles-outline" label="Condition" value={listing.condition} />
            <DetailMetric icon="calendar-outline" label="Listed" value={formatRelativeTime(listing.createdAt)} />
            <DetailMetric icon="globe-outline" label="Region" value={listing.region} />
            <DetailMetric
              icon="cash-outline"
              label={listing.listingType === 'trade' ? 'Swap Value' : 'Price'}
              value={formatCurrency(listing.swapValue || listing.price)}
            />
          </View>

          {listing.bundleItems?.length ? (
            <View style={{ gap: theme.spacing.md }}>
              <AppText variant="section">Bundle Items</AppText>
              {listing.bundleItems.map((item) => (
                <View
                  key={item.id}
                  style={{
                    padding: theme.spacing.lg,
                    borderRadius: theme.radius.xl,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}
                >
                  <AppText variant="card">{item.title}</AppText>
                  <AppText variant="bodyBold" color={theme.colors.primary}>
                    {formatCurrency(item.price)}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}

          {listing.listingType === 'trade' ? (
            <View
              style={{
                padding: theme.spacing.lg,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.primary,
                gap: theme.spacing.sm
              }}
            >
              <AppText variant="section">Looking For</AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                {listing.swapRequest}
              </AppText>
            </View>
          ) : null}

          <View style={{ gap: theme.spacing.md }}>
            <AppText variant="section">Seller Reviews</AppText>
            {listing.seller.reviews.map((review) => (
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
                <AppText variant="micro" color={theme.colors.textMuted}>
                  {formatRelativeTime(review.createdAt)}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.xl,
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border
        }}
      >
        {isMine ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Button
              variant="primary"
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('EditListing', { listingId: listing.id })}
            >
              Edit Listing
            </Button>
            <Button
              variant="danger"
              style={{ flex: 1 }}
              onPress={() =>
                Alert.alert('Remove listing', 'This listing will be marked as removed.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                      removeListing(listing.id);
                      navigation.goBack();
                    }
                  }
                ])
              }
            >
              Remove
            </Button>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Button
              variant="primary"
              style={{ flex: 1 }}
              onPress={openChat}
              left={<Ionicons name="chatbubble-ellipses" size={18} color={theme.colors.white} />}
            >
              Negotiate
            </Button>
            <Button
              variant="secondary"
              style={{ flex: 1 }}
              onPress={handleBuyNow}
            >
              Buy Now
            </Button>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

export default ListingDetailScreen;
