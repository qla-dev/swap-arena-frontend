import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/app/ThemeProvider';
import Avatar from '@/components/ui/Avatar';
import AppText from '@/components/ui/AppText';
import Input from '@/components/ui/Input';
import ScreenContainer from '@/components/layout/ScreenContainer';
import EmptyState from '@/components/layout/EmptyState';
import useChatStore from '@/store/chatStore';
import { formatRelativeTime } from '@/utils/formatters';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const conversations = useChatStore((state) => state.conversations);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      `${conversation.participant.name} ${conversation.lastMessage}`.toLowerCase().includes(normalized)
    );
  }, [conversations, query]);

  return (
    <ScreenContainer noPadding>
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="page">Messages</AppText>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Real-time conversations, offer threads, and unread chat activity.
          </AppText>
        </View>

        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search conversations..."
          left={<Ionicons name="search-outline" size={20} color={theme.colors.textMuted} />}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.huge * 2, gap: theme.spacing.sm }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('ChatView', { conversationId: item.id })}
              style={({ pressed }) => ({
                flexDirection: 'row',
                gap: theme.spacing.md,
                padding: theme.spacing.lg,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.88 : 1
              })}
            >
              <Avatar
                uri={item.participant.avatar}
                label={item.participant.name}
                online={item.online}
                premium={item.participant.isPremium}
              />
              <View style={{ flex: 1, gap: theme.spacing.xs }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
                  <AppText variant="card" numberOfLines={1} style={{ flex: 1 }}>
                    {item.participant.name}
                  </AppText>
                  <AppText variant="micro" color={theme.colors.textMuted}>
                    {formatRelativeTime(item.lastMessageAt)}
                  </AppText>
                </View>
                <AppText variant="body" color={theme.colors.textSecondary} numberOfLines={2}>
                  {item.lastMessage || 'No messages yet'}
                </AppText>
              </View>
              {item.unreadCount > 0 ? (
                <View
                  style={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: theme.colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 6
                  }}
                >
                  <AppText variant="micro" color={theme.colors.white}>
                    {item.unreadCount}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No conversations found"
              description="New chats from listing detail pages will appear here."
            />
          }
        />
      </View>
    </ScreenContainer>
  );
};

export default ChatListScreen;
