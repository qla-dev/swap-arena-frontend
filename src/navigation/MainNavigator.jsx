import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';
import AccountScreen from '@/features/account/screens/AccountScreen';
import ChatListScreen from '@/features/chat/screens/ChatListScreen';
import DiscoveryScreen from '@/features/discovery/screens/DiscoveryScreen';
import HomeScreen from '@/features/home/screens/HomeScreen';
import MyStoreScreen from '@/features/listings/screens/MyStoreScreen';
import useChatStore from '@/store/chatStore';

const MainTabContext = createContext(null);

const tabs = [
  { key: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'Discovery', label: 'Discovery', icon: 'compass-outline', activeIcon: 'compass' },
  { key: 'Chat', label: 'Chat', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
  { key: 'MyStore', label: 'My Store', icon: 'storefront-outline', activeIcon: 'storefront' },
  { key: 'Account', label: 'Account', icon: 'person-outline', activeIcon: 'person' }
];

export const useMainTabs = () => {
  const value = useContext(MainTabContext);
  if (!value) {
    throw new Error('useMainTabs must be used inside MainNavigator');
  }
  return value;
};

const MainNavigator = ({ route }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const unreadChats = useChatStore((state) =>
    state.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0)
  );
  const [activeTab, setActiveTab] = useState(route.params?.tab || 'Home');

  useEffect(() => {
    if (route.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route.params?.tab]);

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);
  const content = {
    Home: <HomeScreen />,
    Discovery: <DiscoveryScreen />,
    Chat: <ChatListScreen />,
    MyStore: <MyStoreScreen />,
    Account: <AccountScreen />
  }[activeTab];

  return (
    <MainTabContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1 }}>{content}</View>
        <View
          style={{
            flexDirection: 'row',
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.background,
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.sm,
            paddingBottom: Math.max(insets.bottom, theme.spacing.md)
          }}
        >
          {tabs.map((tab) => {
            const active = tab.key === activeTab;
            const badgeVisible = tab.key === 'Chat' && unreadChats > 0;

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  paddingVertical: theme.spacing.sm,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <View style={{ position: 'relative' }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: active ? theme.colors.primary : 'transparent'
                    }}
                  >
                    <Ionicons
                      name={active ? tab.activeIcon : tab.icon}
                      size={20}
                      color={active ? theme.colors.white : theme.colors.textMuted}
                    />
                  </View>
                  {badgeVisible ? (
                    <View
                      style={{
                        position: 'absolute',
                        right: -2,
                        top: -2,
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: theme.colors.danger,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 4
                      }}
                    >
                      <AppText variant="micro" color={theme.colors.white}>
                        {unreadChats}
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <AppText
                  variant="micro"
                  color={active ? theme.colors.textPrimary : theme.colors.textMuted}
                >
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </MainTabContext.Provider>
  );
};

export default MainNavigator;
