import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/app/ThemeProvider';
import AppText from '@/components/ui/AppText';
import RootNavigator from '@/navigation/RootNavigator';
import useAuthStore from '@/store/authStore';
import { colors as themeColors } from '@/theme';

const linking = {
  prefixes: ['swaparena://', 'https://swaparena.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          Register: 'register'
        }
      },
      Main: 'app',
      ListingDetail: 'listing/:listingId',
      ChatView: 'chat/:conversationId',
      ChatDetails: 'chat/:conversationId/details',
      Wishlist: 'wishlist',
      AddListing: 'listings/new',
      EditListing: 'listings/:listingId/edit',
      Notifications: 'notifications',
      SalesHistory: 'transactions/sales',
      PurchaseHistory: 'transactions/purchases',
      Premium: 'premium',
      SearchResults: 'search/:query?'
    }
  }
};

const LoadingScreen = ({ themeMode }) => {
  const palette = themeColors[themeMode] || themeColors.dark;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: palette.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16
      }}
    >
      <ActivityIndicator size="large" color={palette.primary} />
      <AppText variant="section" color={palette.textPrimary}>
        SwapArena
      </AppText>
    </View>
  );
};

const App = () => {
  const hydrate = useAuthStore((state) => state.hydrate);
  const themeMode = useAuthStore((state) => state.themeMode);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    hydrate()
      .catch(() => null)
      .finally(() => {
        if (mounted) {
          setReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [hydrate]);

  const palette = themeColors[themeMode] || themeColors.dark;
  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: palette.background,
        card: palette.surface,
        text: palette.textPrimary,
        border: palette.border,
        primary: palette.primary
      }
    }),
    [palette]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider mode={themeMode}>
          <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
          {ready ? (
            <NavigationContainer linking={linking} theme={navigationTheme}>
              <RootNavigator />
            </NavigationContainer>
          ) : (
            <LoadingScreen themeMode={themeMode} />
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
