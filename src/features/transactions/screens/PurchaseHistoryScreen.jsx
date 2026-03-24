import React from 'react';
import { FlatList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import TransactionCard from '@/components/cards/TransactionCard';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import useListingStore from '@/store/listingStore';

const PurchaseHistoryScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const transactions = useListingStore((state) => state.transactions);
  const purchases = transactions.filter((item) => item.buyerName === 'Marcus V.');

  return (
    <ScreenContainer scroll={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
        </Button>
        <View style={{ gap: 2 }}>
          <AppText variant="page">Purchase History</AppText>
          <AppText variant="micro" color={theme.colors.textSecondary}>
            Tracked buyer-side offers and direct purchases
          </AppText>
        </View>
      </View>

      <FlatList
        data={purchases}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.huge * 2, gap: theme.spacing.md }}
        renderItem={({ item }) => <TransactionCard transaction={item} role="buyer" />}
        ListEmptyComponent={
          <EmptyState
            title="No purchases yet"
            description="Direct purchases and accepted buyer offers will appear here."
          />
        }
      />
    </ScreenContainer>
  );
};

export default PurchaseHistoryScreen;
