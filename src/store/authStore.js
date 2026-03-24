import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { currentUser } from '@/utils/mockData';

const TOKEN_KEY = 'swaparena_token';
const WELCOME_KEY = 'swaparena_has_seen_welcome';
const THEME_KEY = 'swaparena_theme_mode';

const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  hasSeenWelcome: false,
  themeMode: 'dark',
  completeWelcome: async () => {
    await SecureStore.setItemAsync(WELCOME_KEY, 'true');
    set({ hasSeenWelcome: true });
  },
  setThemeMode: async (themeMode) => {
    await SecureStore.setItemAsync(THEME_KEY, themeMode);
    set({ themeMode });
  },
  login: async () => {
    const token = 'demo-jwt-token';
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(WELCOME_KEY, 'true');
    set({
      token,
      user: currentUser,
      isAuthenticated: true,
      hasSeenWelcome: true
    });
  },
  register: async () => {
    const token = 'demo-jwt-token';
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(WELCOME_KEY, 'true');
    set({
      token,
      user: currentUser,
      isAuthenticated: true,
      hasSeenWelcome: true
    });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({
      token: null,
      user: null,
      isAuthenticated: false
    });
  },
  hydrate: async () => {
    const [token, hasSeenWelcome, themeMode] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(WELCOME_KEY),
      SecureStore.getItemAsync(THEME_KEY)
    ]);

    set({
      hasSeenWelcome: hasSeenWelcome === 'true',
      themeMode: themeMode || 'dark'
    });

    if (token) {
      set({
        token,
        user: currentUser,
        isAuthenticated: true,
        hasSeenWelcome: true
      });
    }
  }
}));

export default useAuthStore;
