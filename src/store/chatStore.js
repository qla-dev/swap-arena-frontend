import { create } from 'zustand';

import useListingStore from '@/store/listingStore';
import useNotificationStore from '@/store/notificationStore';
import { getListingById, initialConversations } from '@/utils/mockData';

const sortConversations = (conversations) =>
  [...conversations].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

const useChatStore = create((set, get) => ({
  conversations: sortConversations(initialConversations),
  activeConversationId: null,
  setActiveConversation: (activeConversationId) =>
    set((state) => ({
      activeConversationId,
      conversations: activeConversationId
        ? state.conversations.map((conversation) =>
            conversation.id === activeConversationId
              ? { ...conversation, unreadCount: 0 }
              : conversation
          )
        : state.conversations
    })),
  ensureConversation: ({ participant, listingId }) => {
    const existing = get().conversations.find(
      (conversation) =>
        conversation.participant.id === participant.id &&
        (!listingId || conversation.listingId === listingId)
    );

    if (existing) {
      return existing.id;
    }

    const conversationId = `chat-${participant.id}-${Date.now()}`;
    set((state) => ({
      conversations: sortConversations([
        {
          id: conversationId,
          listingId,
          participant,
          lastMessage: '',
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          online: false,
          messages: []
        },
        ...state.conversations
      ])
    }));
    return conversationId;
  },
  sendMessage: (conversationId, text) =>
    set((state) => {
      const createdAt = new Date().toISOString();
      return {
        conversations: sortConversations(
          state.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  lastMessage: text,
                  lastMessageAt: createdAt,
                  messages: [
                    ...conversation.messages,
                    {
                      id: `msg-${Date.now()}`,
                      senderId: 'user-marcus',
                      text,
                      type: 'text',
                      createdAt,
                      isRead: true
                    }
                  ]
                }
              : conversation
          )
        )
      };
    }),
  sendOffer: (conversationId, listingId, amount) =>
    set((state) => {
      const createdAt = new Date().toISOString();
      const listing = getListingById(listingId);
      const text = amount ? `Offered $${amount}` : `Sent an offer for ${listing ? listing.title : 'listing'}`;
      return {
        conversations: sortConversations(
          state.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  lastMessage: text,
                  lastMessageAt: createdAt,
                  messages: [
                    ...conversation.messages,
                    {
                      id: `msg-${Date.now()}`,
                      senderId: 'user-marcus',
                      text,
                      type: 'offer',
                      createdAt,
                      offerAmount: amount || null,
                      offerListingId: listingId,
                      isRead: true
                    }
                  ]
                }
              : conversation
          )
        )
      };
    }),
  clearHistory: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: 'Conversation cleared',
              lastMessageAt: new Date().toISOString(),
              messages: []
            }
          : conversation
      )
    })),
  blockConversation: (conversationId) =>
    set((state) => ({
      activeConversationId:
        state.activeConversationId === conversationId ? null : state.activeConversationId,
      conversations: state.conversations.filter((conversation) => conversation.id !== conversationId)
    })),
  acceptOffer: (conversationId, messageId) =>
    set((state) => {
      const conversation = state.conversations.find((item) => item.id === conversationId);
      const message = conversation && conversation.messages.find((entry) => entry.id === messageId);
      const listing = message && message.offerListingId ? getListingById(message.offerListingId) : null;

      if (!conversation || !message || !listing) {
        return state;
      }

      useListingStore.getState().createTransaction({
        listingId: listing.id,
        listingTitle: listing.title,
        imageUrl: listing.imageUrl,
        buyerName: conversation.participant.name,
        sellerName: 'Marcus V.',
        agreedPrice: message.offerAmount || listing.price,
        status: 'accepted'
      });

      useNotificationStore.getState().addNotification({
        type: 'transaction',
        title: 'Offer Accepted',
        description: `Transaction created for ${listing.title}.`,
        createdAt: new Date().toISOString(),
        readAt: null,
        listingId: listing.id,
        conversationId
      });

      return {
        conversations: sortConversations(
          state.conversations.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  lastMessage: `Offer accepted for ${listing.title}`,
                  lastMessageAt: new Date().toISOString(),
                  messages: [
                    ...item.messages,
                    {
                      id: `msg-${Date.now()}`,
                      senderId: 'user-marcus',
                      text: `Offer accepted for ${listing.title}`,
                      type: 'system',
                      createdAt: new Date().toISOString(),
                      isRead: true
                    }
                  ]
                }
              : item
          )
        )
      };
    }),
  declineOffer: (conversationId, messageId) =>
    set((state) => ({
      conversations: sortConversations(
        state.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                lastMessage: 'Offer declined',
                lastMessageAt: new Date().toISOString(),
                messages: [
                  ...conversation.messages,
                  {
                    id: `msg-${messageId}-declined`,
                    senderId: 'user-marcus',
                    text: 'Offer declined',
                    type: 'system',
                    createdAt: new Date().toISOString(),
                    isRead: true
                  }
                ]
              }
            : conversation
        )
      )
    }))
}));

export default useChatStore;
