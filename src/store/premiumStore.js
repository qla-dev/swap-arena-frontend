import { create } from 'zustand';

import useAuthStore from '@/store/authStore';

const usePremiumStore = create((set) => ({
  isPremium: false,
  premiumUntil: null,
  wishlistLimit: 8,
  upgrade: () => {
    const premiumUntil = '2026-04-24T00:00:00.000Z';
    const auth = useAuthStore.getState();

    if (auth.user) {
      useAuthStore.setState({
        user: {
          ...auth.user,
          isPremium: true,
          premiumUntil
        }
      });
    }

    set({
      isPremium: true,
      premiumUntil,
      wishlistLimit: 999
    });
  },
  revoke: () => {
    const auth = useAuthStore.getState();

    if (auth.user) {
      useAuthStore.setState({
        user: {
          ...auth.user,
          isPremium: false,
          premiumUntil: null
        }
      });
    }

    set({
      isPremium: false,
      premiumUntil: null,
      wishlistLimit: 8
    });
  }
}));

export default usePremiumStore;
