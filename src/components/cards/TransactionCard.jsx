import React from 'react';
import { Image, View } from 'react-native';

import { useTheme } from '@/app/ThemeProvider';
import Badge from '@/components/ui/Badge';
import AppText from '@/components/ui/AppText';
import { formatCurrency, formatShortDate } from '@/utils/formatters';

const toneByStatus = {
  completed: 'success',
  accepted: 'primary',
  pending: 'warning',
  cancelled: 'danger',
  declined: 'danger'
};

const TransactionCard = ({
  transaction,
  role = 'seller'
}) => {
  const theme = useTheme();
  const counterpart = role === 'seller' ? transaction.buyerName : transaction.sellerName;

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}
    >
      <Image
        source={{ uri: transaction.imageUrl }}
        style={{
          width: 76,
          height: 76,
          borderRadius: theme.radius.md
        }}
      />
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
          <AppText variant="card" numberOfLines={2} style={{ flex: 1 }}>
            {transaction.listingTitle}
          </AppText>
          <Badge label={transaction.status} tone={toneByStatus[transaction.status] || 'default'} />
        </View>
        <AppText variant="bodyBold" color={theme.colors.primary}>
          {formatCurrency(transaction.agreedPrice)}
        </AppText>
        <AppText variant="micro" color={theme.colors.textSecondary}>
          {role === 'seller' ? 'Buyer' : 'Seller'} - {counterpart}
        </AppText>
        <AppText variant="micro" color={theme.colors.textMuted}>
          {formatShortDate(transaction.createdAt)}
        </AppText>
      </View>
    </View>
  );
};

export default React.memo(TransactionCard);
