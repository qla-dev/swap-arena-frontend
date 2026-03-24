import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import ChatBubble from '@/components/cards/ChatBubble';
import EmptyState from '@/components/layout/EmptyState';
import Avatar from '@/components/ui/Avatar';
import AppText from '@/components/ui/AppText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import useChatStore from '@/store/chatStore';
import useListingStore from '@/store/listingStore';

const ChatViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const flatListRef = useRef(null);
  const conversations = useChatStore((state) => state.conversations);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sendOffer = useChatStore((state) => state.sendOffer);
  const acceptOffer = useChatStore((state) => state.acceptOffer);
  const declineOffer = useChatStore((state) => state.declineOffer);
  const listings = useListingStore((state) => state.listings);
  const [message, setMessage] = useState('');
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');

  const conversation = useMemo(
    () => conversations.find((item) => item.id === route.params?.conversationId),
    [conversations, route.params?.conversationId]
  );
  const listing = conversation
    ? listings.find((item) => item.id === conversation.listingId)
    : null;

  useEffect(() => {
    if (conversation) {
      setActiveConversation(conversation.id);
    }

    return () => {
      setActiveConversation(null);
    };
  }, [conversation, setActiveConversation]);

  useEffect(() => {
    if (conversation?.messages?.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 80);
    }
  }, [conversation?.messages?.length]);

  if (!conversation) {
    return (
      <ScreenFallback
        title="Conversation unavailable"
        description="This thread may have been removed or blocked."
        actionLabel="Back To Chats"
        onPress={() => navigation.goBack()}
      />
    );
  }

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }
    sendMessage(conversation.id, message.trim());
    setMessage('');
  };

  const handleSendOffer = () => {
    const numeric = Number(offerAmount || 0);
    if (!listing || !numeric) {
      return;
    }
    sendOffer(conversation.id, listing.id, numeric);
    setOfferAmount('');
    setOfferOpen(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xxl,
          paddingBottom: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.background
        }}
      >
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
        </Button>
        <Avatar
          uri={conversation.participant.avatar}
          label={conversation.participant.name}
          online={conversation.online}
          premium={conversation.participant.isPremium}
        />
        <Pressable
          onPress={() => navigation.navigate('ChatDetails', { conversationId: conversation.id })}
          style={{ flex: 1, gap: 2 }}
        >
          <AppText variant="card">{conversation.participant.name}</AppText>
          <AppText variant="micro" color={theme.colors.textSecondary}>
            {conversation.online ? 'Online now' : conversation.participant.responseTime}
          </AppText>
        </Pressable>
        <Button
          variant="secondary"
          size="icon"
          onPress={() => navigation.navigate('ChatDetails', { conversationId: conversation.id })}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textPrimary} />
        </Button>
      </View>

      <FlatList
        ref={flatListRef}
        data={conversation.messages}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.huge,
          gap: theme.spacing.md
        }}
        renderItem={({ item }) => {
          const offerListing = item.offerListingId
            ? listings.find((entry) => entry.id === item.offerListingId)
            : null;
          const isMine = item.senderId === 'user-marcus';

          return (
            <ChatBubble
              message={item}
              isMine={isMine}
              listing={offerListing}
              onPressOffer={() =>
                navigation.navigate('ListingDetail', { listingId: offerListing?.id || listing?.id })
              }
              onAccept={() => acceptOffer(conversation.id, item.id)}
              onDecline={() => declineOffer(conversation.id, item.id)}
            />
          );
        }}
        ListHeaderComponent={
          listing ? (
            <Pressable
              onPress={() => navigation.navigate('ListingDetail', { listingId: listing.id })}
              style={({ pressed }) => ({
                marginBottom: theme.spacing.md,
                padding: theme.spacing.lg,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.88 : 1
              })}
            >
              <AppText variant="caption" color={theme.colors.textMuted}>
                Linked Listing
              </AppText>
              <AppText variant="card" style={{ marginTop: theme.spacing.sm }}>
                {listing.title}
              </AppText>
              <AppText variant="bodyBold" color={theme.colors.primary} style={{ marginTop: 4 }}>
                ${listing.price}
              </AppText>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState title="No messages yet" description="Start the conversation from this listing thread." />
        }
      />

      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.xl,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background
        }}
      >
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-end' }}>
          <Button
            variant="secondary"
            size="icon"
            onPress={() => setOfferOpen(true)}
            style={{ alignSelf: 'stretch' }}
          >
            <Ionicons name="pricetag-outline" size={20} color={theme.colors.textPrimary} />
          </Button>
          <View style={{ flex: 1 }}>
            <Input
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              style={{ gap: 0 }}
            />
          </View>
          <Button
            variant="primary"
            size="icon"
            onPress={handleSend}
            disabled={!message.trim()}
            style={{ alignSelf: 'stretch' }}
          >
            <Ionicons name="send" size={18} color={theme.colors.white} />
          </Button>
        </View>
      </View>

      <Modal visible={offerOpen} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: theme.colors.overlay
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.radius.xxl,
              borderTopRightRadius: theme.radius.xxl,
              padding: theme.spacing.xxl,
              gap: theme.spacing.lg
            }}
          >
            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="section">Send Offer</AppText>
              <AppText variant="body" color={theme.colors.textSecondary}>
                {listing ? `Propose a price for ${listing.title}.` : 'Propose an offer amount.'}
              </AppText>
            </View>
            <Input
              label="Offer Amount"
              value={offerAmount}
              onChangeText={(value) => setOfferAmount(value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <Button variant="secondary" style={{ flex: 1 }} onPress={() => setOfferOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" style={{ flex: 1 }} onPress={handleSendOffer}>
                Send
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const ScreenFallback = ({ title, description, actionLabel, onPress }) => {
  return (
    <View style={{ flex: 1 }}>
      <EmptyState title={title} description={description} actionLabel={actionLabel} onPress={onPress} />
    </View>
  );
};

export default ChatViewScreen;
