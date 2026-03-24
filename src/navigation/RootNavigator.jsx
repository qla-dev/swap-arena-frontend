import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/app/ThemeProvider';
import AuthNavigator from '@/navigation/AuthNavigator';
import MainNavigator from '@/navigation/MainNavigator';
import useAuthStore from '@/store/authStore';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const theme = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background
        }
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen
            name="ListingDetail"
            getComponent={() => require('../features/listings/screens/ListingDetailScreen').default}
          />
          <Stack.Screen
            name="ChatView"
            getComponent={() => require('../features/chat/screens/ChatViewScreen').default}
          />
          <Stack.Screen
            name="ChatDetails"
            getComponent={() => require('../features/chat/screens/ChatDetailsScreen').default}
          />
          <Stack.Screen
            name="Wishlist"
            getComponent={() => require('../features/wishlist/screens/WishlistScreen').default}
          />
          <Stack.Screen
            name="AddListing"
            getComponent={() => require('../features/listings/screens/AddListingScreen').default}
          />
          <Stack.Screen
            name="SalesHistory"
            getComponent={() => require('../features/transactions/screens/SalesHistoryScreen').default}
          />
          <Stack.Screen
            name="PurchaseHistory"
            getComponent={() => require('../features/transactions/screens/PurchaseHistoryScreen').default}
          />
          <Stack.Screen
            name="Notifications"
            getComponent={() => require('../features/notifications/screens/NotificationsScreen').default}
          />
          <Stack.Screen
            name="Settings"
            getComponent={() => require('../features/account/screens/SettingsScreen').default}
          />
          <Stack.Screen
            name="Premium"
            getComponent={() => require('../features/premium/screens/PremiumScreen').default}
          />
          <Stack.Screen
            name="EditListing"
            getComponent={() => require('../features/listings/screens/EditListingScreen').default}
          />
          <Stack.Screen
            name="SearchResults"
            getComponent={() => require('../features/listings/screens/SearchResultsScreen').default}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
