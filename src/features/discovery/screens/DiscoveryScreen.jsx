import React, { useMemo, useState } from 'react';
import { Alert, View, useWindowDimensions } from 'react-native';
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const discoveryFeed = useListingStore((state) => state.discoveryFeed);
  const swipeListing = useListingStore((state) => state.swipeListing);
  const resetDiscovery = useListingStore((state) => state.resetDiscovery);
  const [mode, setMode] = useState('games');
  const cardWidth = Math.min(windowWidth - theme.spacing.xxl * 2, 388);
  const cardHeight = Math.min(
    Math.max(cardWidth * 1.22, 404),
    windowHeight * 0.58
  );
  const deckHeight = cardHeight + theme.spacing.lg;
  const deckTopGapMin = theme.spacing.huge + theme.spacing.sm;
  const deckBottomGapMin = theme.spacing.huge * 2;

  const filteredItems = useMemo(() => {
    if (mode === 'gear') {
      return discoveryFeed.filter((item) => item.platform.includes('Gear'));
    }

    return discoveryFeed.filter((item) => !item.platform.includes('Gear'));
  }, [discoveryFeed, mode]);

  const handleSwipe = (listingId, direction) => {
    if (!listingId) {
      return;
    }

    const result = swipeListing(listingId, direction);
    if (result && result.ok === false) {
      Alert.alert('Wishlist limit reached', result.message, [
        { text: 'Later', style: 'cancel' },
        { text: 'Go Premium', onPress: () => navigation.navigate('Premium') }
      ]);
    }
  };

  return (
    <ScreenContainer noPadding>
      <View
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xxl,
          paddingBottom: theme.spacing.huge
        }}
      >
        <View style={{ gap: theme.spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: theme.spacing.md
            }}
          >
            <AppText variant="page" style={{ flex: 1 }}>
              Discovery
            </AppText>
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
        </View>

        <View
          style={{
            flex: 1,
            width: '100%'
          }}
        >
          {filteredItems.length ? (
            <>
              <View style={{ flex: 1, minHeight: deckTopGapMin }} />
              <View
                style={{
                  height: deckHeight,
                  alignItems: 'center',
                  justifyContent: 'flex-start'
                }}
              >
                {filteredItems
                  .slice(0, 3)
                  .map((item, index) => (
                    <DiscoveryCard
                      key={item.id}
                      listing={item}
                      index={index}
                      isTop={index === 0}
                      onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
                      onSwipeLeft={() => handleSwipe(item.id, 'left')}
                      onSwipeRight={() => handleSwipe(item.id, 'right')}
                    />
                  ))
                  .reverse()}
              </View>
              <View style={{ flex: 2, minHeight: deckBottomGapMin }} />
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <EmptyState
                title="No more discovery cards"
                description="You have already processed every available item for the current mode and filters."
                actionLabel="Reset Discovery"
                onPress={resetDiscovery}
              />
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
};

export default DiscoveryScreen;
