import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import DiscoveryCard from '@/components/cards/DiscoveryCard';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import useListingStore from '@/store/listingStore';

const DiscoveryScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const discoveryFeed = useListingStore((state) => state.discoveryFeed);
  const filters = useListingStore((state) => state.filters);
  const swipeListing = useListingStore((state) => state.swipeListing);
  const resetDiscovery = useListingStore((state) => state.resetDiscovery);
  const [mode, setMode] = useState('games');

  const filteredItems = useMemo(() => {
    if (mode === 'gear') {
      return discoveryFeed.filter((item) => item.platform.includes('Gear'));
    }

    return discoveryFeed.filter((item) => !item.platform.includes('Gear'));
  }, [discoveryFeed, mode]);

  const activeItem = filteredItems[0];

  const handleSwipe = (direction) => {
    if (!activeItem) {
      return;
    }

    const result = swipeListing(activeItem.id, direction);
    if (result && result.ok === false) {
      Alert.alert('Wishlist limit reached', result.message, [
        { text: 'Later', style: 'cancel' },
        { text: 'Go Premium', onPress: () => navigation.navigate('Premium') }
      ]);
    }
  };

  return (
    <ScreenContainer noPadding>
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ gap: theme.spacing.xs, flex: 1 }}>
              <AppText variant="page">Discovery</AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                Swipe by platform, region, and wishlist-aware recommendations.
              </AppText>
            </View>
            <Button
              variant="secondary"
              size="icon"
              onPress={resetDiscovery}
            >
              <Ionicons name="refresh-outline" size={20} color={theme.colors.textPrimary} />
            </Button>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Button
              variant={mode === 'games' ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => setMode('games')}
              style={{ flex: 1 }}
            >
              Games
            </Button>
            <Button
              variant={mode === 'gear' ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => setMode('gear')}
              style={{ flex: 1 }}
            >
              Gear
            </Button>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm
            }}
          >
            <AppText variant="micro" color={theme.colors.textMuted}>
              {filters.region} {filters.platform ? `- ${filters.platform}` : ''}
            </AppText>
            <AppText variant="micro" color={theme.colors.textMuted}>
              {filteredItems.length} cards left
            </AppText>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {filteredItems.length ? (
            <>
              {filteredItems
                .slice(0, 3)
                .map((item, index) => (
                  <DiscoveryCard
                    key={item.id}
                    listing={item}
                    index={index}
                    isTop={index === 0}
                    onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
                    onSwipeLeft={() => handleSwipe('left')}
                    onSwipeRight={() => handleSwipe('right')}
                  />
                ))
                .reverse()}
            </>
          ) : (
            <EmptyState
              title="No more discovery cards"
              description="You have already processed every available item for the current mode and filters."
              actionLabel="Reset Discovery"
              onPress={resetDiscovery}
            />
          )}
        </View>

        {activeItem ? (
          <View
            style={{
              paddingBottom: theme.spacing.huge,
              gap: theme.spacing.md
            }}
          >
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <Button
                variant="secondary"
                size="lg"
                style={{ flex: 1 }}
                onPress={() => handleSwipe('left')}
                left={<Ionicons name="close-outline" size={20} color={theme.colors.textPrimary} />}
              >
                Skip
              </Button>
              <Button
                variant="primary"
                size="lg"
                style={{ flex: 1 }}
                onPress={() => handleSwipe('right')}
                left={<Ionicons name="heart" size={18} color={theme.colors.white} />}
              >
                Wishlist
              </Button>
            </View>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('ListingDetail', { listingId: activeItem.id })}
            >
              View Full Listing
            </Button>
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

export default DiscoveryScreen;
