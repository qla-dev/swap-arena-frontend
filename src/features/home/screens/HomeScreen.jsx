import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/app/ThemeProvider';
import ListingCard from '@/components/cards/ListingCard';
import StoryBubble from '@/components/cards/StoryBubble';
import EmptyState from '@/components/layout/EmptyState';
import SectionHeader from '@/components/layout/SectionHeader';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import useListingStore from '@/store/listingStore';
import useNotificationStore from '@/store/notificationStore';
import { buildHomeFeed, platformFilters, supportedRegions } from '@/utils/mockData';
import {
  formatCurrency,
  formatRelativeTime,
  isExpired
} from '@/utils/formatters';

const platformIcons = {
  PS4: 'logo-playstation',
  PS5: 'logo-playstation',
  Xbox: 'logo-xbox',
  PC: 'desktop-outline',
  Steam: 'logo-steam',
  Switch: 'game-controller-outline',
  Gear: 'headset-outline'
};

const HeaderActionButton = ({
  active = false,
  badgeCount,
  icon,
  label,
  maxWidth,
  onPress,
  theme
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      minWidth: 48,
      height: 48,
      paddingHorizontal: label ? theme.spacing.md : 0,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: active ? theme.colors.primary : theme.colors.borderStrong,
      backgroundColor: active ? theme.colors.backgroundAlt : theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: pressed ? 0.82 : 1,
      maxWidth
    })}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: label ? theme.spacing.sm : 0 }}>
      <Ionicons
        name={icon}
        size={20}
        color={active ? theme.colors.primary : theme.colors.textPrimary}
      />
      {label ? (
        <AppText
          variant="bodyBold"
          numberOfLines={1}
          color={active ? theme.colors.primary : theme.colors.textPrimary}
          style={{ maxWidth: maxWidth ? maxWidth - 56 : undefined }}
        >
          {label}
        </AppText>
      ) : null}
    </View>

    {badgeCount > 0 ? (
      <View
        style={{
          position: 'absolute',
          right: 6,
          top: 6,
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
          {badgeCount}
        </AppText>
      </View>
    ) : null}
  </Pressable>
);

const PlatformFilterButton = ({
  active,
  onPress,
  platform,
  theme
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      width: 62,
      minHeight: 62,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: active ? theme.colors.primary : theme.colors.borderStrong,
      backgroundColor: active ? theme.colors.backgroundAlt : theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.xs,
      opacity: pressed ? 0.82 : 1
    })}
  >
    <Ionicons
      name={platformIcons[platform] || 'pricetag-outline'}
      size={16}
      color={active ? theme.colors.primary : theme.colors.textSecondary}
    />
    <AppText
      variant="micro"
      color={active ? theme.colors.primary : theme.colors.textSecondary}
      style={{ textAlign: 'center' }}
      numberOfLines={1}
    >
      {platform}
    </AppText>
  </Pressable>
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const filters = useListingStore((state) => state.filters);
  const wishlistIds = useListingStore((state) => state.wishlistIds);
  const stories = useListingStore((state) => state.stories);
  const listings = useListingStore((state) => state.listings);
  const myStoreListingIds = useListingStore((state) => state.myStoreListingIds);
  const setRegion = useListingStore((state) => state.setRegion);
  const toggleWishlistOnly = useListingStore((state) => state.toggleWishlistOnly);
  const setSearchQuery = useListingStore((state) => state.setSearchQuery);
  const toggleWishlist = useListingStore((state) => state.toggleWishlist);
  const markStorySeen = useListingStore((state) => state.markStorySeen);
  const addStory = useListingStore((state) => state.addStory);

  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [platformRowVisible, setPlatformRowVisible] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    if (Array.isArray(filters.platform)) {
      return filters.platform;
    }
    return filters.platform ? [filters.platform] : [];
  });
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 250);
  const lowerSectionPaddingLeft = theme.spacing.xl;
  const lowerSectionPaddingRight = theme.spacing.lg;
  const isWishlistFilterActive = filters.wishlistOnly;
  const isMenuFilterActive = platformRowVisible;
  const menuButtonIcon = isWishlistFilterActive
    ? 'heart'
    : isMenuFilterActive
      ? 'funnel'
      : 'menu-outline';
  const sectionKeys = platformRowVisible
    ? ['stories', 'search', 'platform', 'community', 'today', 'wanted']
    : ['stories', 'search', 'community', 'today', 'wanted'];
  const baseHomeFeed = useMemo(
    () => buildHomeFeed({ ...filters, platform: null }, wishlistIds),
    [filters, wishlistIds]
  );
  const filteredHomeFeed = useMemo(() => {
    if (!selectedPlatforms.length) {
      return {
        communityOffers: baseHomeFeed.communityOffers,
        todayInStore: baseHomeFeed.todayInStore,
        mostWanted: baseHomeFeed.mostWanted
      };
    }

    const applyPlatformSelection = (items) =>
      items.filter((item) => item.platform.some((platform) => selectedPlatforms.includes(platform)));

    return {
      communityOffers: applyPlatformSelection(baseHomeFeed.communityOffers),
      todayInStore: applyPlatformSelection(baseHomeFeed.todayInStore),
      mostWanted: applyPlatformSelection(baseHomeFeed.mostWanted)
    };
  }, [baseHomeFeed, selectedPlatforms]);
  const searchSuggestions = useMemo(() => {
    const normalizedQuery = searchInput.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    const seenTitles = new Set();

    return listings
      .filter((item) => item.title.toLowerCase().includes(normalizedQuery))
      .filter((item) => {
        const normalizedTitle = item.title.toLowerCase();
        if (seenTitles.has(normalizedTitle)) {
          return false;
        }
        seenTitles.add(normalizedTitle);
        return true;
      })
      .slice(0, 6);
  }, [listings, searchInput]);
  const homeCardWidth = Math.floor(
    (windowWidth - lowerSectionPaddingLeft - lowerSectionPaddingRight - theme.spacing.md) / 2
  );

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  const myListings = useMemo(
    () => listings.filter((listing) => myStoreListingIds.includes(listing.id) && listing.status === 'active'),
    [listings, myStoreListingIds]
  );

  const activeStories = useMemo(
    () =>
      {
        const orderedStories = [...stories].sort((left, right) => {
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
        });
        const visibleStories = orderedStories.filter(
          (story) => story.isSelf || !isExpired(story.expiresAt)
        );

        return visibleStories.some((story) => !story.isSelf)
          ? visibleStories
          : orderedStories;
      },
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

  const toggleRegionMenu = () => {
    setHeaderMenuOpen(false);
    setRegionMenuOpen((current) => !current);
  };

  const toggleHeaderMenu = () => {
    setRegionMenuOpen(false);
    setHeaderMenuOpen((current) => !current);
  };

  const handleToggleWishlistFilter = () => {
    if (!isWishlistFilterActive && isMenuFilterActive) {
      setPlatformRowVisible(true);
    }
    toggleWishlistOnly();
    setHeaderMenuOpen(false);
  };

  const handleMenuFilterPress = () => {
    if (isWishlistFilterActive) {
      toggleWishlistOnly();
    }
    setPlatformRowVisible((current) => !current);
    setHeaderMenuOpen(false);
  };

  const handleTogglePlatform = (platform) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    setSearchSuggestionsOpen(Boolean(value.trim()));
  };

  const handleSelectSuggestion = (title) => {
    setSearchInput(title);
    setSearchSuggestionsOpen(false);
    setSearchQuery(title);
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
      avatarConfig: listing.seller.avatarConfig || null,
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
    <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xxl, gap: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.md }}>
        <AppText variant="page" style={{ flex: 1 }}>
          Home Feed
        </AppText>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <HeaderActionButton
            theme={theme}
            icon="location-outline"
            onPress={toggleRegionMenu}
          />
          <HeaderActionButton
            theme={theme}
            badgeCount={unreadCount}
            icon="notifications-outline"
            onPress={() => navigation.navigate('Notifications')}
          />
          <HeaderActionButton
            theme={theme}
            active={isWishlistFilterActive || isMenuFilterActive}
            icon={menuButtonIcon}
            onPress={toggleHeaderMenu}
          />
        </View>
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
    </View>
  );

  const renderStoriesSection = () => (
    <View style={{ gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg }}>
      <FlatList
        horizontal
        data={activeStories}
        renderItem={({ item }) => <StoryBubble story={item} onPress={() => openStory(item)} />}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: theme.spacing.md }}
      />
    </View>
  );

  const renderSearchSection = () => (
    <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}>
      <Input
        value={searchInput}
        onChangeText={handleSearchChange}
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
      {searchSuggestionsOpen && searchSuggestions.length ? (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.border,
            overflow: 'hidden'
          }}
        >
          {searchSuggestions.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handleSelectSuggestion(item.title)}
              style={({ pressed }) => ({
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                backgroundColor: pressed ? theme.colors.backgroundAlt : theme.colors.surface,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: theme.colors.border
              })}
            >
              <AppText variant="bodyBold">{item.title}</AppText>
              <AppText variant="micro" color={theme.colors.textSecondary}>
                {item.platform.join(' | ')}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );

  const renderPlatformSection = () => (
    <View style={{ paddingHorizontal: theme.spacing.lg }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {platformFilters.map((platform) => (
            <PlatformFilterButton
              key={platform}
              theme={theme}
              platform={platform}
              active={selectedPlatforms.includes(platform)}
              onPress={() => handleTogglePlatform(platform)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderHomeCard = (item) => (
    <ListingCard
      listing={item}
      compact
      isWishlisted={wishlistIds.includes(item.id)}
      onToggleWishlist={() => handleToggleWishlist(item.id)}
      onPress={() => openListing(item.id)}
    />
  );

  const renderGrid = (items) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
      {items.map((item) => (
        <View key={item.id} style={{ width: homeCardWidth }}>
          {renderHomeCard(item)}
        </View>
      ))}
    </View>
  );

  const renderHorizontal = (items) => (
    <FlatList
      horizontal
      data={items}
      renderItem={({ item }) => (
        <View style={{ width: homeCardWidth }}>
          {renderHomeCard(item)}
        </View>
      )}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ gap: theme.spacing.md }}
    />
  );

  const renderSection = ({ item }) => {
    if (item === 'stories') {
      return renderStoriesSection();
    }

    if (item === 'search') {
      return renderSearchSection();
    }

    if (item === 'platform') {
      return renderPlatformSection();
    }

    if (item === 'community') {
      return (
        <View style={{ gap: theme.spacing.lg, paddingLeft: lowerSectionPaddingLeft, paddingRight: lowerSectionPaddingRight }}>
          <SectionHeader title="Community Offers" />
          {filteredHomeFeed.communityOffers.length ? (
            renderGrid(filteredHomeFeed.communityOffers)
          ) : (
            <EmptyState title="No community offers" description="Try a broader region or reset filters." />
          )}
        </View>
      );
    }

    if (item === 'today') {
      return (
        <View style={{ gap: theme.spacing.lg, paddingLeft: lowerSectionPaddingLeft, paddingRight: lowerSectionPaddingRight }}>
          <SectionHeader title="Today in Store" actionLabel="Search All" onPress={() => navigation.navigate('SearchResults', { query: '' })} />
          {filteredHomeFeed.todayInStore.length ? (
            renderHorizontal(filteredHomeFeed.todayInStore)
          ) : (
            <EmptyState title="No store listings" description="Try another region or platform filter." />
          )}
        </View>
      );
    }

    return (
      <View style={{ gap: theme.spacing.lg, paddingLeft: lowerSectionPaddingLeft, paddingRight: lowerSectionPaddingRight }}>
        <SectionHeader title="Most Wanted Games" />
        {filteredHomeFeed.mostWanted.length ? (
          renderGrid(filteredHomeFeed.mostWanted)
        ) : (
          <EmptyState title="No wanted items" description="Most wanted listings will appear here when filters match." />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, width: '100%', backgroundColor: theme.colors.background }}>
      <FlatList
        style={{ flex: 1, width: '100%', alignSelf: 'stretch' }}
        data={sectionKeys}
        renderItem={renderSection}
        keyExtractor={(item) => item}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={{ marginBottom: theme.spacing.xxl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        contentContainerStyle={{
          paddingBottom: theme.spacing.huge * 3
        }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.xxl }} />}
      />

      <Modal visible={headerMenuOpen} transparent animationType="fade" onRequestClose={() => setHeaderMenuOpen(false)}>
        <View style={{ flex: 1 }}>
          <Pressable
            onPress={() => setHeaderMenuOpen(false)}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />

          <View
            style={{
              paddingTop: Math.max(insets.top + theme.spacing.huge, theme.spacing.huge * 2),
              paddingHorizontal: theme.spacing.lg,
              alignItems: 'flex-end'
            }}
          >
            <View
              style={{
                gap: theme.spacing.sm
              }}
            >
              <HeaderActionButton
                theme={theme}
                active={isWishlistFilterActive}
                icon={isWishlistFilterActive ? 'heart' : 'heart-outline'}
                onPress={handleToggleWishlistFilter}
              />
              <HeaderActionButton
                theme={theme}
                active={isMenuFilterActive}
                icon={isMenuFilterActive ? 'funnel' : 'funnel-outline'}
                onPress={handleMenuFilterPress}
              />
            </View>
          </View>
        </View>
      </Modal>

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
    </SafeAreaView>
  );
};

export default HomeScreen;
