import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import DiscoveryCard from '@/components/cards/DiscoveryCard';
import ListingCard from '@/components/cards/ListingCard';
import StoryBubble from '@/components/cards/StoryBubble';
import EmptyState from '@/components/layout/EmptyState';
import SectionHeader from '@/components/layout/SectionHeader';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import useListingStore from '@/store/listingStore';
import useNotificationStore from '@/store/notificationStore';
import usePremiumStore from '@/store/premiumStore';
import {
  platformFilters,
  supportedRegions
} from '@/utils/mockData';
import {
  formatCurrency,
  formatRelativeTime,
  isExpired
} from '@/utils/formatters';

const sectionKeys = ['stories', 'community', 'today', 'wanted'];

const HomeScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const homeFeed = useListingStore((state) => state.homeFeed);
  const filters = useListingStore((state) => state.filters);
  const wishlistIds = useListingStore((state) => state.wishlistIds);
  const stories = useListingStore((state) => state.stories);
  const listings = useListingStore((state) => state.listings);
  const myStoreListingIds = useListingStore((state) => state.myStoreListingIds);
  const setRegion = useListingStore((state) => state.setRegion);
  const setPlatform = useListingStore((state) => state.setPlatform);
  const toggleWishlistOnly = useListingStore((state) => state.toggleWishlistOnly);
  const setSearchQuery = useListingStore((state) => state.setSearchQuery);
  const toggleWishlist = useListingStore((state) => state.toggleWishlist);
  const markStorySeen = useListingStore((state) => state.markStorySeen);
  const addStory = useListingStore((state) => state.addStory);
  const isPremium = usePremiumStore((state) => state.isPremium);

  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  const myListings = useMemo(
    () => listings.filter((listing) => myStoreListingIds.includes(listing.id) && listing.status === 'active'),
    [listings, myStoreListingIds]
  );

  const activeStories = useMemo(
    () =>
      [...stories]
        .filter((story) => !isExpired(story.expiresAt))
        .sort((left, right) => {
          if (left.isSelf) {
            return -1;
          }
          if (right.isSelf) {
            return 1;
          }
          if (left.isSeen === right.isSeen) {
            return 0;
          }
          return left.isSeen ? 1 : -1;
        }),
    [stories]
  );

  const storyListing = selectedStory?.listingId
    ? listings.find((item) => item.id === selectedStory.listingId)
    : null;

  const handleToggleWishlist = (listingId) => {
    const result = toggleWishlist(listingId);
    if (result && result.ok === false) {
      navigation.navigate('Premium');
    }
  };

  const openListing = (listingId) => {
    navigation.navigate('ListingDetail', { listingId });
  };

  const openStory = (story) => {
    if (story.isSelf) {
      setShowCreateStory(true);
      return;
    }

    markStorySeen(story.id);
    setSelectedStory(story);
  };

  const publishStory = (listing) => {
    addStory({
      id: `story-${Date.now()}`,
      username: 'Your Story',
      avatar: listing.seller.avatar,
      offerImage: listing.imageUrl,
      offerTitle: listing.title,
      offerPrice: listing.price,
      isSeen: false,
      isSelf: true,
      listingId: listing.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
    setShowCreateStory(false);
  };

  const renderHeader = () => (
    <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, gap: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <AppText variant="page">Home Feed</AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Stories, community offers, and today's store picks.
          </AppText>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Notifications')}
          style={({ pressed }) => ({
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong,
            opacity: pressed ? 0.82 : 1
          })}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
          {unreadCount > 0 ? (
            <View
              style={{
                position: 'absolute',
                right: 8,
                top: 8,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: theme.colors.danger,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4
              }}
            >
              <AppText variant="micro" color={theme.colors.white}>
                {unreadCount}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Input
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search games, gear, sellers..."
        left={<Ionicons name="search-outline" size={20} color={theme.colors.textMuted} />}
        right={
          searchInput ? (
            <Pressable onPress={() => navigation.navigate('SearchResults', { query: searchInput })}>
              <Ionicons name="arrow-forward-circle-outline" size={20} color={theme.colors.primary} />
            </Pressable>
          ) : null
        }
      />

      <View style={{ gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => setRegionMenuOpen((current) => !current)}
            left={<Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />}
            style={{ flex: 1 }}
          >
            {filters.region}
          </Button>
          <Button
            variant={filters.wishlistOnly ? 'primary' : 'secondary'}
            size="sm"
            onPress={toggleWishlistOnly}
            left={
              <Ionicons
                name={filters.wishlistOnly ? 'heart' : 'heart-outline'}
                size={16}
                color={filters.wishlistOnly ? theme.colors.white : theme.colors.textSecondary}
              />
            }
          >
            Wishlist
          </Button>
        </View>

        {regionMenuOpen ? (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              overflow: 'hidden'
            }}
          >
            {supportedRegions.map((region) => (
              <Pressable
                key={region}
                onPress={() => {
                  setRegion(region);
                  setRegionMenuOpen(false);
                }}
                style={({ pressed }) => ({
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.lg,
                  backgroundColor:
                    region === filters.region
                      ? theme.colors.backgroundAlt
                      : pressed
                        ? theme.colors.backgroundAlt
                        : theme.colors.surface
                })}
              >
                <AppText
                  variant="bodyBold"
                  color={region === filters.region ? theme.colors.primary : theme.colors.textPrimary}
                >
                  {region}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Button
              variant={!filters.platform ? 'primary' : 'pill'}
              size="sm"
              onPress={() => setPlatform(null)}
              style={{ borderRadius: theme.radius.pill }}
            >
              All
            </Button>
            {platformFilters.map((platform) => (
              <Button
                key={platform}
                variant={filters.platform === platform ? 'primary' : 'pill'}
                size="sm"
                onPress={() => setPlatform(filters.platform === platform ? null : platform)}
                style={{ borderRadius: theme.radius.pill }}
              >
                {platform}
              </Button>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderStoriesSection = () => (
    <View style={{ gap: theme.spacing.lg }}>
      <SectionHeader title="Stories" />
      {activeStories.length ? (
        <FlatList
          horizontal
          data={activeStories}
          renderItem={({ item }) => <StoryBubble story={item} onPress={() => openStory(item)} />}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: theme.spacing.lg, gap: theme.spacing.md }}
        />
      ) : (
        <EmptyState
          title="No stories right now"
          description="Create a temporary story from one of your listings to highlight a flash deal."
          actionLabel="Create Story"
          onPress={() => setShowCreateStory(true)}
        />
      )}
    </View>
  );

  const renderGrid = (items) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
      {items.map((item) => (
        <View key={item.id} style={{ width: '47.8%' }}>
          <ListingCard
            listing={item}
            compact
            isWishlisted={wishlistIds.includes(item.id)}
            onToggleWishlist={() => handleToggleWishlist(item.id)}
            onPress={() => openListing(item.id)}
          />
        </View>
      ))}
    </View>
  );

  const renderHorizontal = (items) => (
    <FlatList
      horizontal
      data={items}
      renderItem={({ item }) => (
        <ListingCard
          listing={item}
          horizontal
          isWishlisted={wishlistIds.includes(item.id)}
          onToggleWishlist={() => handleToggleWishlist(item.id)}
          onPress={() => openListing(item.id)}
        />
      )}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: theme.spacing.lg, gap: theme.spacing.md }}
    />
  );

  const renderSection = ({ item }) => {
    if (item === 'stories') {
      return renderStoriesSection();
    }

    if (item === 'community') {
      return (
        <View style={{ gap: theme.spacing.lg }}>
          <SectionHeader title="Community Offers" />
          {homeFeed.communityOffers.length ? (
            renderGrid(homeFeed.communityOffers)
          ) : (
            <EmptyState title="No community offers" description="Try a broader region or reset filters." />
          )}
        </View>
      );
    }

    if (item === 'today') {
      return (
        <View style={{ gap: theme.spacing.lg }}>
          <SectionHeader title="Today In Store" actionLabel="Search All" onPress={() => navigation.navigate('SearchResults', { query: '' })} />
          {homeFeed.todayInStore.length ? (
            renderHorizontal(homeFeed.todayInStore)
          ) : (
            <EmptyState title="No store listings" description="Try another region or platform filter." />
          )}
        </View>
      );
    }

    return (
      <View style={{ gap: theme.spacing.lg }}>
        <SectionHeader title="Most Wanted" actionLabel={isPremium ? 'Premium View' : 'Go Premium'} onPress={() => navigation.navigate('Premium')} />
        {homeFeed.mostWanted.length ? (
          renderGrid(homeFeed.mostWanted)
        ) : (
          <EmptyState title="No wanted items" description="Most wanted listings will appear here when filters match." />
        )}
      </View>
    );
  };

  return (
    <ScreenContainer noPadding>
      <FlatList
        data={sectionKeys}
        renderItem={renderSection}
        keyExtractor={(item) => item}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: theme.spacing.huge * 3,
          gap: theme.spacing.xxl
        }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.xxl, paddingHorizontal: theme.spacing.lg }} />}
      />

      <Modal visible={Boolean(selectedStory)} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'center',
            padding: theme.spacing.lg
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.xxl,
              overflow: 'hidden'
            }}
          >
            {selectedStory ? (
              <>
                <Image source={{ uri: selectedStory.offerImage }} style={{ width: '100%', height: 360 }} />
                <View style={{ padding: theme.spacing.xxl, gap: theme.spacing.md }}>
                  <View style={{ gap: theme.spacing.xs }}>
                    <AppText variant="section">{selectedStory.offerTitle}</AppText>
                    <AppText variant="bodyBold" color={theme.colors.primary}>
                      {formatCurrency(selectedStory.offerPrice)}
                    </AppText>
                    <AppText variant="micro" color={theme.colors.textSecondary}>
                      {selectedStory.username} - {formatRelativeTime(selectedStory.expiresAt)}
                    </AppText>
                  </View>
                  <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                    <Button variant="secondary" style={{ flex: 1 }} onPress={() => setSelectedStory(null)}>
                      Close
                    </Button>
                    <Button
                      variant="primary"
                      style={{ flex: 1 }}
                      onPress={() => {
                        if (storyListing) {
                          setSelectedStory(null);
                          openListing(storyListing.id);
                        }
                      }}
                    >
                      View Listing
                    </Button>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={showCreateStory} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: theme.colors.overlay
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.radius.xxl,
              borderTopRightRadius: theme.radius.xxl,
              padding: theme.spacing.xxl,
              gap: theme.spacing.lg,
              maxHeight: '72%'
            }}
          >
            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="section">Create Story</AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Pick one of your active listings to post as a 24-hour story.
              </AppText>
            </View>
            <FlatList
              data={myListings}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ListingCard
                  listing={item}
                  compact={false}
                  isWishlisted={wishlistIds.includes(item.id)}
                  onToggleWishlist={() => handleToggleWishlist(item.id)}
                  onPress={() => publishStory(item)}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
              ListEmptyComponent={
                <EmptyState
                  title="No active listings"
                  description="Create a listing first, then you can push it into stories from the home feed."
                  actionLabel="Add Listing"
                  onPress={() => {
                    setShowCreateStory(false);
                    navigation.navigate('AddListing');
                  }}
                />
              }
            />
            <Button variant="secondary" onPress={() => setShowCreateStory(false)}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default HomeScreen;
