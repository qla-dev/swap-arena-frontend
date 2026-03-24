import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import ListingForm from '@/features/listings/components/ListingForm';
import buildListingPayload from '@/features/listings/utils/buildListingPayload';
import useAuthStore from '@/store/authStore';
import useListingStore from '@/store/listingStore';
import usePremiumStore from '@/store/premiumStore';

const EditListingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const listings = useListingStore((state) => state.listings);
  const updateListing = useListingStore((state) => state.updateListing);
  const user = useAuthStore((state) => state.user);
  const isPremium = usePremiumStore((state) => state.isPremium);
  const premiumUntil = usePremiumStore((state) => state.premiumUntil);
  const [loading, setLoading] = useState(false);

  const listing = useMemo(
    () => listings.find((item) => item.id === route.params?.listingId),
    [listings, route.params?.listingId]
  );

  if (!listing) {
    return (
      <ScreenContainer>
        <EmptyState title="Listing not found" description="This listing can no longer be edited." actionLabel="Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const initialValues = {
    title: listing.title,
    description: listing.description,
    price: String(listing.price),
    platform: listing.platform,
    condition: listing.condition,
    listingType: listing.listingType,
    isBoosted: listing.isBoosted
  };

  const handleSubmit = async (form) => {
    setLoading(true);
    const payload = buildListingPayload({
      form,
      user: {
        ...user,
        isPremium,
        premiumUntil
      },
      existing: listing
    });
    updateListing(listing.id, payload);
    setLoading(false);
    navigation.replace('ListingDetail', { listingId: listing.id });
  };

  return (
    <ScreenContainer noPadding>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md }}>
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
        </Button>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="page">Edit Listing</AppText>
          <AppText variant="micro" color={theme.colors.textSecondary}>
            Update details, condition, pricing, and premium boost state.
          </AppText>
        </View>
      </View>
      <ListingForm
        initialValues={initialValues}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        isPremium={isPremium}
        loading={loading}
      />
    </ScreenContainer>
  );
};

export default EditListingScreen;
