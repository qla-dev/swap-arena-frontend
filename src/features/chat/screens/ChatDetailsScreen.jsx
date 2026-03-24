import React, { useMemo } from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Avatar from '@/components/ui/Avatar';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import useChatStore from '@/store/chatStore';
import useListingStore from '@/store/listingStore';

const ActionRow = ({ icon, label, description, onPress, danger }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        opacity: pressed ? 0.88 : 1
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: danger ? 'rgba(239,68,68,0.12)' : theme.colors.backgroundAlt,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? theme.colors.danger : theme.colors.primary}
        />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="card" color={danger ? theme.colors.danger : theme.colors.textPrimary}>
          {label}
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary}>
          {description}
        </AppText>
      </View>
      <Ionicons name="chevron-forward-outline" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
};

const ChatDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const conversations = useChatStore((state) => state.conversations);
  const clearHistory = useChatStore((state) => state.clearHistory);
  const blockConversation = useChatStore((state) => state.blockConversation);
  const listings = useListingStore((state) => state.listings);

  const conversation = useMemo(
    () => conversations.find((item) => item.id === route.params?.conversationId),
    [conversations, route.params?.conversationId]
  );
  const listing = conversation
    ? listings.find((item) => item.id === conversation.listingId)
    : null;
  const sharedItems = conversation?.messages.filter((message) => message.type === 'offer') || [];

  if (!conversation) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Chat details unavailable"
          description="This conversation is no longer available."
          actionLabel="Back"
          onPress={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <View style={{ gap: theme.spacing.xxl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
          </Button>
          <AppText variant="page">Chat Details</AppText>
        </View>

        <View
          style={{
            padding: theme.spacing.xxl,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.xxl,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
            gap: theme.spacing.md
          }}
        >
          <Avatar
            uri={conversation.participant.avatar}
            label={conversation.participant.name}
            size={84}
            premium={conversation.participant.isPremium}
          />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <AppText variant="section">{conversation.participant.name}</AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              {conversation.participant.username} - {conversation.participant.location}
            </AppText>
            <AppText variant="micro" color={theme.colors.textMuted}>
              {conversation.participant.responseTime}
            </AppText>
          </View>
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
          <AppText variant="section">Shared Media</AppText>
          {sharedItems.length ? (
            <FlatList
              horizontal
              data={sharedItems}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: theme.spacing.md }}
              renderItem={({ item }) => {
                const offerListing = item.offerListingId
                  ? listings.find((entry) => entry.id === item.offerListingId)
                  : listing;

                return (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('ListingDetail', {
                        listingId: offerListing?.id
                      })
                    }
                    style={({ pressed }) => ({
                      width: 180,
                      padding: theme.spacing.lg,
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.radius.xl,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      opacity: pressed ? 0.88 : 1
                    })}
                  >
                    <AppText variant="caption" color={theme.colors.textMuted}>
                      Offer
                    </AppText>
                    <AppText variant="card" style={{ marginTop: theme.spacing.sm }}>
                      {offerListing?.title || 'Listing'}
                    </AppText>
                    <AppText variant="bodyBold" color={theme.colors.primary} style={{ marginTop: 4 }}>
                      ${item.offerAmount || offerListing?.price || 0}
                    </AppText>
                  </Pressable>
                );
              }}
            />
          ) : (
            <EmptyState title="No shared media" description="Offers and shared assets will appear here." />
          )}
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="section">Chat Settings</AppText>
          <ActionRow
            icon="person-circle-outline"
            label="Seller Profile"
            description={`${conversation.participant.name} - ${conversation.participant.rating} rating`}
            onPress={() =>
              Alert.alert(
                conversation.participant.name,
                `${conversation.participant.bio}\n\nBadges: ${conversation.participant.badges.join(', ')}`
              )
            }
          />
          <ActionRow
            icon="search-outline"
            label="Open Linked Listing"
            description="View the product tied to this negotiation."
            onPress={() => listing && navigation.navigate('ListingDetail', { listingId: listing.id })}
          />
          <ActionRow
            icon="trash-outline"
            label="Clear Chat History"
            description="Remove visible messages from this conversation."
            onPress={() =>
              Alert.alert('Clear history', 'Remove all visible messages from this thread?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: () => clearHistory(conversation.id)
                }
              ])
            }
          />
          <ActionRow
            icon="flag-outline"
            label="Report User"
            description="Flag spam, scams, or abusive behavior."
            onPress={() => Alert.alert('Report submitted', 'This user has been flagged for review.')}
            danger
          />
          <ActionRow
            icon="ban-outline"
            label="Block User"
            description="Remove the conversation and prevent future messages."
            onPress={() =>
              Alert.alert('Block user', `Block ${conversation.participant.name}?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Block',
                  style: 'destructive',
                  onPress: () => {
                    blockConversation(conversation.id);
                    navigation.navigate('Main', { tab: 'Chat' });
                  }
                }
              ])
            }
            danger
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default ChatDetailsScreen;
