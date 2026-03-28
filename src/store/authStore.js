import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { currentUser } from '@/utils/mockData';

const TOKEN_KEY = 'swaparena_token';
const WELCOME_KEY = 'swaparena_has_seen_welcome';
const THEME_KEY = 'swaparena_theme_mode';
const PROFILE_KEY = 'swaparena_profile_overrides';
const PREFERENCES_KEY = 'swaparena_account_preferences';

const defaultPreferences = {
  notificationsEnabled: true,
  privacyMode: 'Public',
  language: 'English',
  securityMode: 'Standard',
  blockedUsers: []
};

const safeParse = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const buildUser = (profileOverrides = {}) => ({
  ...currentUser,
  ...profileOverrides
});

const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  hasSeenWelcome: false,
  themeMode: 'dark',
  profileOverrides: {},
  ...defaultPreferences,
  completeWelcome: async () => {
    await SecureStore.setItemAsync(WELCOME_KEY, 'true');
    set({ hasSeenWelcome: true });
  },
  setThemeMode: async (themeMode) => {
    await SecureStore.setItemAsync(THEME_KEY, themeMode);
    set({ themeMode });
  },
  updateUserProfile: async (profilePatch) => {
    const profileOverrides = {
      ...get().profileOverrides,
      ...profilePatch
    };

    await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profileOverrides));
    set((state) => ({
      profileOverrides,
      user: state.user
        ? {
            ...state.user,
            ...profilePatch
          }
        : state.user
    }));
  },
  updatePreferences: async (patch) => {
    const nextPreferences = {
      notificationsEnabled: patch.notificationsEnabled ?? get().notificationsEnabled,
      privacyMode: patch.privacyMode ?? get().privacyMode,
      language: patch.language ?? get().language,
      securityMode: patch.securityMode ?? get().securityMode,
      blockedUsers: patch.blockedUsers ?? get().blockedUsers
    };

    await SecureStore.setItemAsync(PREFERENCES_KEY, JSON.stringify(nextPreferences));
    set(nextPreferences);
  },
  setNotificationsEnabled: async (notificationsEnabled) =>
    get().updatePreferences({ notificationsEnabled }),
  setPrivacyMode: async (privacyMode) =>
    get().updatePreferences({ privacyMode }),
  setLanguage: async (language) =>
    get().updatePreferences({ language }),
  setSecurityMode: async (securityMode) =>
    get().updatePreferences({ securityMode }),
  setBlockedUsers: async (blockedUsers) =>
    get().updatePreferences({ blockedUsers }),
  login: async () => {
    const token = 'demo-jwt-token';
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(WELCOME_KEY, 'true');
    set({
      token,
      user: buildUser(get().profileOverrides),
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
      user: buildUser(get().profileOverrides),
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
    const [token, hasSeenWelcome, themeMode, storedProfileOverrides, storedPreferences] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(WELCOME_KEY),
      SecureStore.getItemAsync(THEME_KEY),
      SecureStore.getItemAsync(PROFILE_KEY),
      SecureStore.getItemAsync(PREFERENCES_KEY)
    ]);
    const profileOverrides = safeParse(storedProfileOverrides, {});
    const preferences = {
      ...defaultPreferences,
      ...safeParse(storedPreferences, {})
    };

    set({
      hasSeenWelcome: hasSeenWelcome === 'true',
      themeMode: themeMode || 'dark',
      profileOverrides,
      ...preferences
    });

    if (token) {
      set({
        token,
        user: buildUser(profileOverrides),
        isAuthenticated: true,
        hasSeenWelcome: true
      });
    }
  }
}));

export default useAuthStore;
