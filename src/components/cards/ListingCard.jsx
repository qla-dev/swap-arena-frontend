import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/app/ThemeProvider';
import Badge from '@/components/ui/Badge';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';

const ListingCard = ({
  listing,
  onPress,
  isWishlisted,
  onToggleWishlist,
  compact = false,
  horizontal = false
}) => {
  const theme = useTheme();
  const width = horizontal ? 232 : '100%';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
          opacity: pressed ? 0.88 : 1
        },
        theme.shadows.card
      ]}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: listing.imageUrl }}
          style={{
            width: '100%',
            height: horizontal ? 220 : compact ? 208 : 240
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: theme.spacing.md,
            right: theme.spacing.md,
            top: theme.spacing.md,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, flex: 1 }}>
            {listing.platform.slice(0, 2).map((platform) => (
              <Badge key={`${listing.id}-${platform}`} label={platform} />
            ))}
            {listing.seller?.isPremium ? <Badge label="PRO" tone="warning" /> : null}
          </View>
          <Button
            variant={isWishlisted ? 'primary' : 'secondary'}
            size="icon"
            onPress={onToggleWishlist}
            style={{
              width: 38,
              minWidth: 38,
              minHeight: 38,
              height: 38,
              borderRadius: theme.radius.pill
            }}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={18}
              color={isWishlisted ? theme.colors.white : theme.colors.textPrimary}
            />
          </Button>
        </View>
        {listing.isBoosted ? (
          <Badge
            label="Boosted"
            tone="warning"
            style={{
              position: 'absolute',
              left: theme.spacing.md,
              bottom: theme.spacing.md
            }}
          />
        ) : null}
      </View>

      <View
        style={{
          padding: theme.spacing.lg,
          gap: theme.spacing.sm
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <View style={{ minHeight: theme.typography.cardTitle.lineHeight * 2 }}>
              <AppText variant="card" numberOfLines={2}>
                {listing.title}
              </AppText>
            </View>
            <AppText variant="micro" color={theme.colors.textSecondary}>
              {listing.seller.name} - {listing.distance}
            </AppText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="bodyBold" color={theme.colors.primary}>
              {formatCurrency(listing.price)}
            </AppText>
            {listing.discount ? (
              <AppText variant="micro" color={theme.colors.danger}>
                -{listing.discount}%
              </AppText>
            ) : null}
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm }}>
          <AppText variant="micro" color={theme.colors.textMuted}>
            {listing.listingType === 'trade' ? 'Swap' : 'Sale'}
          </AppText>
          <AppText variant="micro" color={theme.colors.textMuted}>
            {listing.condition}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

export default React.memo(ListingCard);
