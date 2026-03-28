import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, View, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Avatar from '@/components/ui/Avatar';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SheetModal from '@/components/ui/SheetModal';
import useAuthStore from '@/store/authStore';
import useListingStore from '@/store/listingStore';
import usePremiumStore from '@/store/premiumStore';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

const profileTabs = [
  { key: 'wishlist', label: 'Wishlist', icon: 'heart-outline' },
  { key: 'sales', label: 'Sales', icon: 'cash-outline' },
  { key: 'listings', label: 'My Listings', icon: 'grid-outline' },
  { key: 'saved', label: 'Saved Offers', icon: 'bookmark-outline' }
];

const avatarColorOptions = [
  { key: 'primary', label: 'Indigo' },
  { key: 'secondary', label: 'Violet' },
  { key: 'info', label: 'Sky' },
  { key: 'success', label: 'Green' },
  { key: 'warning', label: 'Amber' },
  { key: 'danger', label: 'Red' }
];

const avatarStyleOptions = [
  { key: 'plain', label: 'Plain', icon: null },
  { key: 'person', label: 'Person', icon: 'person' },
  { key: 'gamer', label: 'Gamer', icon: 'game-controller' },
  { key: 'shield', label: 'Shield', icon: 'shield-checkmark' },
  { key: 'flash', label: 'Flash', icon: 'flash' }
];

const getInitials = (value = '') => {
  const parts = String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  const compact = String(value).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return compact.slice(0, 2) || 'SA';
};

const sanitizeInitials = (value = '') =>
  String(value)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 2);

const buildAvatarDraft = (user) => {
  const generatedAvatar = user?.avatarConfig?.type === 'generated'
    ? user.avatarConfig
    : null;

  return {
    backgroundColorKey: generatedAvatar?.backgroundColorKey || avatarColorOptions[0].key,
    initials: generatedAvatar?.initials || getInitials(user?.name),
    icon: generatedAvatar?.icon || null
  };
};

const buildGridItem = (listing, overrides = {}) => ({
  id: overrides.id || listing.id,
  listingId: overrides.listingId || listing.id,
  imageUrl: overrides.imageUrl || listing.imageUrl,
  title: overrides.title || listing.title,
  metaLabel: overrides.metaLabel || (listing.listingType === 'trade' ? 'Trade' : 'Sale'),
  accentLabel: overrides.accentLabel || formatCurrency(listing.price),
  listingType: listing.listingType
});

const ProfileStat = ({ label, value }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: '47%',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.backgroundAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 2
      }}
    >
      <AppText variant="section">{value}</AppText>
      <AppText variant="micro" color={theme.colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
};

const ProfileFact = ({ icon, label }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.backgroundAlt,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}
    >
      <Ionicons name={icon} size={14} color={theme.colors.primary} />
      <AppText variant="micro" color={theme.colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
};

const PhotoOptionButton = ({ icon, title, description, onPress }) => {
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
          width: 44,
          height: 44,
          borderRadius: 22,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.backgroundAlt
        }}
      >
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="card">{title}</AppText>
        <AppText variant="body" color={theme.colors.textSecondary}>
          {description}
        </AppText>
      </View>
      <Ionicons name="chevron-forward-outline" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
};

const ProfileTabButton = ({ tab, count, selected, onPress }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          minHeight: 68,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: selected ? theme.colors.backgroundAlt : theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
          opacity: pressed ? 0.86 : 1
        },
        selected ? theme.shadows.card : null
      ]}
    >
      <Ionicons
        name={tab.icon}
        size={18}
        color={selected ? theme.colors.primary : theme.colors.textSecondary}
      />
      <AppText
        variant="micro"
        color={selected ? theme.colors.primary : theme.colors.textSecondary}
        numberOfLines={1}
      >
        {tab.label}
      </AppText>
      <AppText variant="micro" color={selected ? theme.colors.textPrimary : theme.colors.textMuted}>
        {count}
      </AppText>
    </Pressable>
  );
};

const AvatarChoiceChip = ({ label, selected, onPress, previewColor, icon }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: 76,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.xl,
        backgroundColor: selected ? theme.colors.backgroundAlt : theme.colors.surface,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        opacity: pressed ? 0.88 : 1
      })}
    >
      {previewColor ? (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: previewColor,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong
          }}
        />
      ) : (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.colors.backgroundAlt,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon ? (
            <Ionicons name={icon} size={14} color={theme.colors.primary} />
          ) : (
            <Ionicons name="remove" size={14} color={theme.colors.textMuted} />
          )}
        </View>
      )}
      <AppText
        variant="micro"
        color={selected ? theme.colors.primary : theme.colors.textSecondary}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

const ProfileGridTile = ({ item, size, onPress }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.9 : 1
        },
        theme.shadows.card
      ]}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{
          width: '100%',
          height: '100%'
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          justifyContent: 'space-between',
          padding: theme.spacing.sm
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View
            style={{
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.overlay
            }}
          >
            <AppText variant="micro" color={theme.colors.white}>
              {item.metaLabel}
            </AppText>
          </View>
        </View>

        <View
          style={{
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.overlay,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.sm,
            gap: 2
          }}
        >
          <AppText variant="micro" color={theme.colors.white} numberOfLines={1}>
            {item.title}
          </AppText>
          <AppText variant="micro" color={theme.colors.white} numberOfLines={1}>
            {item.accentLabel}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

const AccountScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const user = useAuthStore((state) => state.user);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const listings = useListingStore((state) => state.listings);
  const wishlistIds = useListingStore((state) => state.wishlistIds);
  const savedOfferIds = useListingStore((state) => state.savedOfferIds);
  const myStoreListingIds = useListingStore((state) => state.myStoreListingIds);
  const transactions = useListingStore((state) => state.transactions);
  const syncCurrentUserProfile = useListingStore((state) => state.syncCurrentUserProfile);
  const isPremium = usePremiumStore((state) => state.isPremium);
  const premiumUntil = usePremiumStore((state) => state.premiumUntil);
  const [selectedTab, setSelectedTab] = useState('wishlist');
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [avatarBuilderOpen, setAvatarBuilderOpen] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null);
  const [avatarDraft, setAvatarDraft] = useState({
    backgroundColorKey: avatarColorOptions[0].key,
    initials: 'SA',
    icon: null
  });

  const gridGap = theme.spacing.sm;
  const horizontalPadding = theme.spacing.lg;
  const gridTileSize = Math.floor((width - (horizontalPadding * 2) - (gridGap * 2)) / 3);

  const myListings = useMemo(
    () => listings
      .filter((item) => myStoreListingIds.includes(item.id) && item.status === 'active')
      .map((item) => buildGridItem(item, {
        metaLabel: item.listingType === 'trade' ? 'Trade' : 'Live',
        accentLabel: item.listingType === 'trade'
          ? `Swap ${formatCurrency(item.swapValue || item.price)}`
          : formatCurrency(item.price)
      })),
    [listings, myStoreListingIds]
  );

  const wishlistItems = useMemo(
    () => listings
      .filter((item) => wishlistIds.includes(item.id))
      .map((item) => buildGridItem(item, {
        metaLabel: 'Wishlist',
        accentLabel: formatCurrency(item.price)
      })),
    [listings, wishlistIds]
  );

  const savedOffers = useMemo(
    () => listings
      .filter((item) => savedOfferIds.includes(item.id))
      .map((item) => buildGridItem(item, {
        metaLabel: 'Saved',
        accentLabel: formatCurrency(item.price)
      })),
    [listings, savedOfferIds]
  );

  const salesItems = useMemo(
    () =>
      transactions
        .filter((item) => item.sellerName === user?.name)
        .map((sale) => {
          const linkedListing = listings.find((item) => item.id === sale.listingId);

          if (linkedListing) {
            return buildGridItem(linkedListing, {
              id: sale.id,
              listingId: linkedListing.id,
              imageUrl: sale.imageUrl || linkedListing.imageUrl,
              title: sale.listingTitle || linkedListing.title,
              metaLabel: sale.status === 'completed' ? 'Completed' : 'Sold',
              accentLabel: formatCurrency(sale.agreedPrice)
            });
          }

          return {
            id: sale.id,
            listingId: null,
            imageUrl: sale.imageUrl,
            title: sale.listingTitle,
            metaLabel: sale.status === 'completed' ? 'Completed' : 'Sold',
            accentLabel: formatCurrency(sale.agreedPrice)
          };
        }),
    [listings, transactions, user?.name]
  );

  const profileCollections = useMemo(() => ({
    wishlist: {
      items: wishlistItems,
      emptyTitle: 'Wishlist is empty',
      emptyDescription: 'Tap the heart on listings you want to keep close.'
    },
    sales: {
      items: salesItems,
      emptyTitle: 'No sales yet',
      emptyDescription: 'Completed seller transactions will show up here as soon as they land.'
    },
    listings: {
      items: myListings,
      emptyTitle: 'No active listings',
      emptyDescription: 'Your live listings will appear here in a compact profile grid.'
    },
    saved: {
      items: savedOffers,
      emptyTitle: 'No saved offers',
      emptyDescription: 'Bookmark listings you want to revisit later.'
    }
  }), [myListings, salesItems, savedOffers, wishlistItems]);

  if (!user) {
    return null;
  }

  const ensureCameraPermission = async () => {
    const current = await ImagePicker.getCameraPermissionsAsync();

    if (current.granted) {
      return true;
    }

    const requested = await ImagePicker.requestCameraPermissionsAsync();
    return requested.granted;
  };

  const ensureMediaLibraryPermission = async () => {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (current.granted) {
      return true;
    }

    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return requested.granted;
  };

  const saveProfileAvatar = async (avatarConfig) => {
    const avatarUri = avatarConfig.type === 'image' ? avatarConfig.uri : null;

    await updateUserProfile({
      avatar: avatarUri,
      avatarConfig
    });
    syncCurrentUserProfile({
      userId: user.id,
      avatar: avatarUri,
      avatarConfig
    });
  };

  const handlePickProfileImage = async (source) => {
    setPhotoModalOpen(false);

    try {
      const hasPermission = source === 'camera'
        ? await ensureCameraPermission()
        : await ensureMediaLibraryPermission();

      if (!hasPermission) {
        setFeedbackState({
          title: source === 'camera' ? 'Camera permission needed' : 'Photo access needed',
          description: source === 'camera'
            ? 'Allow camera access to take a new profile picture.'
            : 'Allow photo library access to choose a profile picture from your gallery.'
        });
        return;
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
          });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      await saveProfileAvatar({
        type: 'image',
        uri: result.assets[0].uri
      });
    } catch (error) {
      setFeedbackState({
        title: 'Photo unavailable',
        description: 'That profile photo action could not be completed right now. Please try again.'
      });
    }
  };

  const handleOpenAvatarBuilder = () => {
    setAvatarDraft(buildAvatarDraft(user));
    setPhotoModalOpen(false);
    setAvatarBuilderOpen(true);
  };

  const handleSaveGeneratedAvatar = async () => {
    const initials = sanitizeInitials(avatarDraft.initials) || getInitials(user.name);

    try {
      await saveProfileAvatar({
        type: 'generated',
        initials,
        backgroundColorKey: avatarDraft.backgroundColorKey,
        icon: avatarDraft.icon
      });
      setAvatarBuilderOpen(false);
    } catch (error) {
      setFeedbackState({
        title: 'Avatar unavailable',
        description: 'Your generated avatar could not be saved right now. Please try again.'
      });
    }
  };

  const openGridItem = (item) => {
    if (!item.listingId) {
      return;
    }

    navigation.navigate('ListingDetail', { listingId: item.listingId });
  };

  const collection = profileCollections[selectedTab];
  const counts = {
    wishlist: wishlistItems.length,
    sales: salesItems.length,
    listings: myListings.length,
    saved: savedOffers.length
  };

  return (
    <>
      <ScreenContainer noPadding>
        <FlatList
          data={collection.items}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProfileGridTile
              item={item}
              size={gridTileSize}
              onPress={() => openGridItem(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: theme.spacing.huge * 2
          }}
          columnWrapperStyle={{ gap: gridGap }}
          ItemSeparatorComponent={() => <View style={{ height: gridGap }} />}
          removeClippedSubviews
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
          ListHeaderComponent={(
            <View style={{ paddingTop: theme.spacing.xl, gap: theme.spacing.xl }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.md }}>
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
                  <Pressable
                    onPress={() => setPhotoModalOpen(true)}
                    style={({ pressed }) => ({
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                      opacity: pressed ? 0.88 : 1
                    })}
                  >
                    <View style={{ position: 'relative' }}>
                      <Avatar
                        uri={user.avatar}
                        avatarConfig={user.avatarConfig}
                        label={user.name}
                        size={96}
                        premium={isPremium}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          right: 0,
                          bottom: 2,
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: theme.colors.primary,
                          borderWidth: 2,
                          borderColor: theme.colors.background,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Ionicons name="camera-outline" size={16} color={theme.colors.white} />
                      </View>
                    </View>
                    <AppText variant="micro" color={theme.colors.textSecondary}>
                      Change photo
                    </AppText>
                  </Pressable>

                  <View style={{ flex: 1, gap: theme.spacing.xs }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                      <AppText variant="section">{user.name}</AppText>
                      {user.verified ? (
                        <Ionicons name="shield-checkmark" size={16} color={theme.colors.info} />
                      ) : null}
                      {isPremium ? (
                        <Ionicons name="flash" size={16} color={theme.colors.warning} />
                      ) : null}
                    </View>
                    <AppText variant="body" color={theme.colors.textSecondary} numberOfLines={1}>
                      {user.username} - {user.location}
                    </AppText>
                    <AppText variant="body" color={theme.colors.textSecondary} numberOfLines={2}>
                      {user.bio}
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

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
                  <ProfileStat label="Wishlist" value={`${counts.wishlist}`} />
                  <ProfileStat label="Sales" value={`${counts.sales}`} />
                  <ProfileStat label="Listings" value={`${counts.listings}`} />
                  <ProfileStat label="Saved" value={`${counts.saved}`} />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                  <ProfileFact icon="time-outline" label={user.responseTime} />
                  <ProfileFact icon="location-outline" label={user.region} />
                  <ProfileFact icon="chatbubble-ellipses-outline" label={`${user.ratingCount} reviews`} />
                </View>
              </View>

              {!isPremium ? (
                <Pressable
                  onPress={() => navigation.navigate('Premium')}
                  style={({ pressed }) => ({
                    padding: theme.spacing.xl,
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
                    Unlock unlimited wishlist items, boosted listings, and premium profile perks.
                  </AppText>
                </Pressable>
              ) : null}

              <View style={{ gap: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                  {profileTabs.map((tab) => (
                    <ProfileTabButton
                      key={tab.key}
                      tab={tab}
                      count={counts[tab.key]}
                      selected={selectedTab === tab.key}
                      onPress={() => setSelectedTab(tab.key)}
                    />
                  ))}
                </View>
                <AppText variant="micro" color={theme.colors.textSecondary}>
                  {collection.items.length} items in {profileTabs.find((tab) => tab.key === selectedTab)?.label.toLowerCase()}
                </AppText>
              </View>
            </View>
          )}
          ListHeaderComponentStyle={{ marginBottom: theme.spacing.lg }}
          ListEmptyComponent={(
            <View style={{ paddingTop: theme.spacing.lg }}>
              <EmptyState
                title={collection.emptyTitle}
                description={collection.emptyDescription}
              />
            </View>
          )}
        />
      </ScreenContainer>

      <SheetModal
        visible={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Change Profile Picture"
        description="Choose how you want to update your account photo."
        footer={(
          <Button variant="secondary" onPress={() => setPhotoModalOpen(false)}>
            Close
          </Button>
        )}
      >
        <PhotoOptionButton
          icon="images-outline"
          title="Choose from Gallery"
          description="Pick a square-friendly image from your photo library."
          onPress={() => handlePickProfileImage('gallery')}
        />
        <PhotoOptionButton
          icon="camera-outline"
          title="Take Photo"
          description="Open the camera and capture a fresh profile picture."
          onPress={() => handlePickProfileImage('camera')}
        />
        <PhotoOptionButton
          icon="sparkles-outline"
          title="Make Avatar"
          description="Create a lightweight initials avatar in a few taps."
          onPress={handleOpenAvatarBuilder}
        />
      </SheetModal>

      <SheetModal
        visible={avatarBuilderOpen}
        onClose={() => setAvatarBuilderOpen(false)}
        title="Make Avatar"
        description="Pick a color, choose 1-2 initials, and add an optional icon."
        footer={(
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Button variant="secondary" style={{ flex: 1 }} onPress={() => setAvatarBuilderOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" style={{ flex: 1 }} onPress={handleSaveGeneratedAvatar}>
              Save Avatar
            </Button>
          </View>
        )}
      >
        <View
          style={{
            alignItems: 'center',
            paddingVertical: theme.spacing.md,
            borderRadius: theme.radius.xxl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}
        >
          <Avatar
            avatarConfig={{
              type: 'generated',
              initials: sanitizeInitials(avatarDraft.initials) || getInitials(user.name),
              backgroundColorKey: avatarDraft.backgroundColorKey,
              icon: avatarDraft.icon
            }}
            label={user.name}
            size={96}
          />
        </View>

        <Input
          label="Initials"
          value={avatarDraft.initials}
          onChangeText={(value) =>
            setAvatarDraft((current) => ({
              ...current,
              initials: sanitizeInitials(value)
            }))
          }
          placeholder={getInitials(user.name)}
          autoCapitalize="characters"
          maxLength={2}
          helperText="Keep it short so the avatar stays clean."
        />

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Background
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {avatarColorOptions.map((option) => (
              <AvatarChoiceChip
                key={option.key}
                label={option.label}
                selected={avatarDraft.backgroundColorKey === option.key}
                previewColor={theme.colors[option.key]}
                onPress={() =>
                  setAvatarDraft((current) => ({
                    ...current,
                    backgroundColorKey: option.key
                  }))
                }
              />
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Style
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {avatarStyleOptions.map((option) => (
              <AvatarChoiceChip
                key={option.key}
                label={option.label}
                icon={option.icon}
                selected={avatarDraft.icon === option.icon}
                onPress={() =>
                  setAvatarDraft((current) => ({
                    ...current,
                    icon: option.icon
                  }))
                }
              />
            ))}
          </View>
        </View>
      </SheetModal>

      <SheetModal
        visible={Boolean(feedbackState)}
        onClose={() => setFeedbackState(null)}
        title={feedbackState?.title}
        description={feedbackState?.description}
        showCloseButton={false}
        footer={(
          <Button variant="primary" onPress={() => setFeedbackState(null)}>
            Close
          </Button>
        )}
      />
    </>
  );
};

export default AccountScreen;
