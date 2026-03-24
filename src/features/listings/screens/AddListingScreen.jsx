import React, { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import ListingForm from '@/features/listings/components/ListingForm';
import buildListingPayload from '@/features/listings/utils/buildListingPayload';
import useAuthStore from '@/store/authStore';
import useListingStore from '@/store/listingStore';
import usePremiumStore from '@/store/premiumStore';

const AddListingScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const addListing = useListingStore((state) => state.addListing);
  const user = useAuthStore((state) => state.user);
  const isPremium = usePremiumStore((state) => state.isPremium);
  const premiumUntil = usePremiumStore((state) => state.premiumUntil);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (form) => {
    setLoading(true);
    const listing = buildListingPayload({
      form,
      user: {
        ...user,
        isPremium,
        premiumUntil
      }
    });
    addListing(listing);
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
          <AppText variant="page">Add Listing</AppText>
          <AppText variant="micro" color={theme.colors.textSecondary}>
            Create a marketplace listing with premium-aware boost controls.
          </AppText>
        </View>
      </View>
      <ListingForm
        submitLabel="Publish Listing"
        onSubmit={handleSubmit}
        isPremium={isPremium}
        loading={loading}
      />
    </ScreenContainer>
  );
};

export default AddListingScreen;
