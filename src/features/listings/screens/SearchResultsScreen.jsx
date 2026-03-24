import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ListingCard from '@/components/cards/ListingCard';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import useListingStore from '@/store/listingStore';
import { searchListings } from '@/utils/mockData';

const SearchResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const listings = useListingStore((state) => state.listings);
  const wishlistIds = useListingStore((state) => state.wishlistIds);
  const toggleWishlist = useListingStore((state) => state.toggleWishlist);
  const [query, setQuery] = useState(route.params?.query || '');
  const debounced = useDebouncedValue(query, 250);

  useEffect(() => {
    setQuery(route.params?.query || '');
  }, [route.params?.query]);

  const results = useMemo(() => searchListings(debounced, listings), [debounced, listings]);

  return (
    <ScreenContainer scroll={false} noPadding>
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, gap: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
          </Button>
          <View style={{ flex: 1 }}>
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Search listings..."
              left={<Ionicons name="search-outline" size={20} color={theme.colors.textMuted} />}
            />
          </View>
        </View>

        <AppText variant="micro" color={theme.colors.textMuted}>
          {results.length} results
        </AppText>

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.huge * 2, gap: theme.spacing.md }}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              isWishlisted={wishlistIds.includes(item.id)}
              onToggleWishlist={() => toggleWishlist(item.id)}
              onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No matching listings"
              description="Try broader keywords, another platform, or a different region."
            />
          }
        />
      </View>
    </ScreenContainer>
  );
};

export default SearchResultsScreen;
