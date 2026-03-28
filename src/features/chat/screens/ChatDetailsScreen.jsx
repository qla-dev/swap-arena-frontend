import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import EmptyState from '@/components/layout/EmptyState';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Avatar from '@/components/ui/Avatar';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SheetModal from '@/components/ui/SheetModal';
import useChatStore from '@/store/chatStore';
import useListingStore from '@/store/listingStore';

const reportReasons = [
  'Scam / fraud',
  'Abusive behavior',
  'Spam',
  'Inappropriate content',
  'Fake profile',
  'Other'
];

const SettingsRow = ({ label, onPress, danger, isLast }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.colors.border
      })}
    >
      <AppText variant="card" color={danger ? theme.colors.danger : theme.colors.textPrimary}>
        {label}
      </AppText>
      <Ionicons
        name="chevron-forward-outline"
        size={18}
        color={danger ? theme.colors.danger : theme.colors.textMuted}
      />
    </Pressable>
  );
};

const ReportReasonRow = ({ label, selected, onPress }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        backgroundColor: selected ? theme.colors.surfaceAlt : theme.colors.surface,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        opacity: pressed ? 0.88 : 1
      })}
    >
      <AppText variant="card">{label}</AppText>
      {selected ? (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Ionicons name="checkmark" size={14} color={theme.colors.white} />
        </View>
      ) : (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong
          }}
        />
      )}
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
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
  const [blockUserOpen, setBlockUserOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null);
  const [selectedReportReasons, setSelectedReportReasons] = useState([]);
  const [customReason, setCustomReason] = useState('');

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

  const closeReportModal = () => {
    setReportOpen(false);
    setSelectedReportReasons([]);
    setCustomReason('');
  };

  const toggleReportReason = (reason) => {
    setSelectedReportReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason]
    );
  };

  const openProfile = () => {
    navigation.navigate('ChatUserProfile', {
      participant: conversation.participant,
      listingId: conversation.listingId
    });
  };

  const handleClearHistory = () => {
    setClearHistoryOpen(false);
    clearHistory(conversation.id);
    setFeedbackState({
      title: 'Chat history cleared',
      description: 'Visible messages were removed from this conversation.'
    });
  };

  const handleBlockUser = () => {
    setBlockUserOpen(false);
    blockConversation(conversation.id);
    navigation.navigate('Main', { tab: 'Chat' });
  };

  const handleReport = (shouldBlock) => {
    const compiledReasons = selectedReportReasons
      .filter((reason) => reason !== 'Other')
      .concat(selectedReportReasons.includes('Other') ? [customReason.trim()] : [])
      .filter(Boolean);

    if (!compiledReasons.length) {
      return;
    }

    closeReportModal();

    if (shouldBlock) {
      blockConversation(conversation.id);
      navigation.navigate('Main', { tab: 'Chat' });
      return;
    }

    setFeedbackState({
      title: 'Report submitted',
      description: `${conversation.participant.name} was reported for ${compiledReasons.join(', ')}.`
    });
  };

  const settingsRows = [
    {
      key: 'profile',
      label: 'View Profile',
      onPress: openProfile
    },
    ...(listing
      ? [
          {
            key: 'listing',
            label: 'Open Linked Listing',
            onPress: () => navigation.navigate('ListingDetail', { listingId: listing.id })
          }
        ]
      : []),
    {
      key: 'clear',
      label: 'Clear Chat History',
      onPress: () => setClearHistoryOpen(true)
    },
    {
      key: 'report',
      label: 'Report User',
      onPress: () => setReportOpen(true),
      danger: true
    },
    {
      key: 'block',
      label: 'Block User',
      onPress: () => setBlockUserOpen(true),
      danger: true
    }
  ];

  const hasOtherReason = selectedReportReasons.includes('Other');
  const canSubmitReport = Boolean(
    selectedReportReasons.length && (!hasOtherReason || customReason.trim())
  );

  return (
    <>
      <ScreenContainer scroll contentContainerStyle={{ paddingTop: theme.spacing.lg }}>
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
              avatarConfig={conversation.participant.avatarConfig}
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
            <View
              style={{
                borderRadius: theme.radius.xxl,
                overflow: 'hidden',
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}
            >
              {settingsRows.map((row, index) => (
                <SettingsRow
                  key={row.key}
                  label={row.label}
                  onPress={row.onPress}
                  danger={row.danger}
                  isLast={index === settingsRows.length - 1}
                />
              ))}
            </View>
          </View>
        </View>
      </ScreenContainer>

      <SheetModal
        visible={clearHistoryOpen}
        onClose={() => setClearHistoryOpen(false)}
        title="Clear Chat History"
        description="Remove all visible messages from this conversation?"
        footer={(
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Button variant="secondary" style={{ flex: 1 }} onPress={() => setClearHistoryOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" style={{ flex: 1 }} onPress={handleClearHistory}>
              Clear
            </Button>
          </View>
        )}
      />

      <SheetModal
        visible={blockUserOpen}
        onClose={() => setBlockUserOpen(false)}
        title="Block User"
        description={`Block ${conversation.participant.name} and remove this conversation?`}
        footer={(
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Button variant="secondary" style={{ flex: 1 }} onPress={() => setBlockUserOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" style={{ flex: 1 }} onPress={handleBlockUser}>
              Block
            </Button>
          </View>
        )}
      />

      <SheetModal
        visible={reportOpen}
        onClose={closeReportModal}
        title="Report User"
        description="Choose the reason that best describes this conversation."
        footer={(
          <View style={{ gap: theme.spacing.md }}>
            <Button
              variant="primary"
              onPress={() => handleReport(false)}
              disabled={!canSubmitReport}
            >
              Report user
            </Button>
            <Button
              variant="danger"
              onPress={() => handleReport(true)}
              disabled={!canSubmitReport}
            >
              Report and block user
            </Button>
          </View>
        )}
      >
        <View style={{ gap: theme.spacing.md }}>
          {reportReasons.map((reason) => (
            <ReportReasonRow
              key={reason}
              label={reason}
              selected={selectedReportReasons.includes(reason)}
              onPress={() => toggleReportReason(reason)}
            />
          ))}
        </View>

        {hasOtherReason ? (
          <Input
            label="Custom reason"
            value={customReason}
            onChangeText={setCustomReason}
            placeholder="Tell us what happened..."
            autoCapitalize="sentences"
            multiline
          />
        ) : null}
      </SheetModal>

      <SheetModal
        visible={Boolean(feedbackState)}
        onClose={() => setFeedbackState(null)}
        title={feedbackState?.title}
        description={feedbackState?.description}
        showCloseButton={false}
        footer={(
          <Button variant="primary" onPress={() => setFeedbackState(null)}>
            Close
          </Button>
        )}
      />
    </>
  );
};

export default ChatDetailsScreen;
