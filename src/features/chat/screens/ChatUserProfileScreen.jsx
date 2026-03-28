import React, { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import useListingStore from '@/store/listingStore';
import { formatRelativeTime } from '@/utils/formatters';

const StatCard = ({ icon, label, value }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: '47%',
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.sm
      }}
    >
      <Ionicons name={icon} size={20} color={theme.colors.primary} />
      <AppText variant="micro" color={theme.colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="bodyBold">{value}</AppText>
    </View>
  );
};

const ChatUserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const listings = useListingStore((state) => state.listings);
  const participant = route.params?.participant;
  const listingId = route.params?.listingId;

  const listing = useMemo(
    () => listings.find((item) => item.id === listingId),
    [listingId, listings]
  );

  if (!participant) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Profile unavailable"
          description="This user profile could not be loaded."
          actionLabel="Back"
          onPress={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll contentContainerStyle={{ paddingTop: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.xxl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
          </Button>
          <AppText variant="page">Profile</AppText>
        </View>

        <View
          style={{
            padding: theme.spacing.xxl,
            borderRadius: theme.radius.xxl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            gap: theme.spacing.lg,
            alignItems: 'center'
          }}
        >
          <Avatar
            uri={participant.avatar}
            label={participant.name}
            size={88}
            premium={participant.isPremium}
          />

          <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <AppText variant="section">{participant.name}</AppText>
              {participant.verified ? (
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.info} />
              ) : null}
              {participant.isPremium ? (
                <Ionicons name="flash" size={16} color={theme.colors.warning} />
              ) : null}
            </View>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {participant.username} - {participant.location}
            </AppText>
            <AppText variant="micro" color={theme.colors.textMuted}>
              {participant.responseTime}
            </AppText>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' }}>
            {participant.badges.map((badge) => (
              <Badge
                key={`${participant.id}-${badge}`}
                label={badge}
                tone={badge.toLowerCase().includes('premium') ? 'warning' : 'default'}
              />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
          <StatCard icon="star-outline" label="Rating" value={`${participant.rating}/5`} />
          <StatCard icon="chatbubble-outline" label="Reviews" value={`${participant.ratingCount}`} />
          <StatCard icon="location-outline" label="Region" value={participant.region} />
          <StatCard icon="time-outline" label="Response" value={participant.responseTime} />
        </View>

        <View
          style={{
            padding: theme.spacing.xxl,
            borderRadius: theme.radius.xxl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            gap: theme.spacing.sm
          }}
        >
          <AppText variant="section">About</AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            {participant.bio}
          </AppText>
        </View>

        {listing ? (
          <Pressable
            onPress={() => navigation.navigate('ListingDetail', { listingId: listing.id })}
            style={({ pressed }) => ({
              padding: theme.spacing.lg,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              gap: theme.spacing.sm,
              opacity: pressed ? 0.88 : 1
            })}
          >
            <AppText variant="caption" color={theme.colors.textMuted}>
              Linked Listing
            </AppText>
            <AppText variant="card">{listing.title}</AppText>
            <AppText variant="bodyBold" color={theme.colors.primary}>
              ${listing.price}
            </AppText>
          </Pressable>
        ) : null}

        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="section">Latest Reviews</AppText>
          {participant.reviews?.length ? (
            <FlatList
              scrollEnabled={false}
              data={participant.reviews}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: theme.spacing.md }}
              renderItem={({ item }) => (
                <View
                  style={{
                    padding: theme.spacing.lg,
                    borderRadius: theme.radius.xl,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    gap: theme.spacing.sm
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
                    <AppText variant="card">{item.reviewerName}</AppText>
                    <AppText variant="micro" color={theme.colors.warning}>
                      {item.rating}/5
                    </AppText>
                  </View>
                  <AppText variant="body" color={theme.colors.textSecondary}>
                    {item.comment}
                  </AppText>
                  <AppText variant="micro" color={theme.colors.textMuted}>
                    {formatRelativeTime(item.createdAt)}
                  </AppText>
                </View>
              )}
            />
          ) : (
            <EmptyState
              title="No reviews yet"
              description="New profile reviews will show up here."
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
};

export default ChatUserProfileScreen;
