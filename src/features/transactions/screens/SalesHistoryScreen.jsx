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

const SalesHistoryScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const transactions = useListingStore((state) => state.transactions);
  const sales = transactions.filter((item) => item.sellerName === 'Marcus V.');

  return (
    <ScreenContainer scroll={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
        </Button>
        <View style={{ gap: 2 }}>
          <AppText variant="page">Sales History</AppText>
          <AppText variant="micro" color={theme.colors.textSecondary}>
            Completed and accepted seller-side transactions
          </AppText>
        </View>
      </View>

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.huge * 2, gap: theme.spacing.md }}
        renderItem={({ item }) => <TransactionCard transaction={item} role="seller" />}
        ListEmptyComponent={
          <EmptyState
            title="No sales yet"
            description="Accepted offers and completed seller transactions will appear here."
          />
        }
      />
    </ScreenContainer>
  );
};

export default SalesHistoryScreen;
