import { create } from 'zustand';

import useNotificationStore from '@/store/notificationStore';
import usePremiumStore from '@/store/premiumStore';
import {
  allListings,
  applyListingFilters,
  buildHomeFeed,
  defaultFilters,
  initialTransactions,
  myStoreListingIds,
  savedOfferSeedIds,
  storyFeed,
  wishlistSeedIds
} from '@/utils/mockData';

const discoveryIds = ['1', '2', '3', '101', '201', '202'];

const computeDiscoveryFeed = (listings, filters, wishlistIds, swipedIds) =>
  applyListingFilters(
    listings.filter((item) => discoveryIds.includes(item.id)),
    filters,
    wishlistIds
  ).filter((item) => !swipedIds.includes(item.id) && item.status === 'active');

const useListingStore = create((set, get) => ({
  listings: allListings,
  stories: storyFeed,
  homeFeed: buildHomeFeed(),
  discoveryFeed: computeDiscoveryFeed(allListings, defaultFilters, wishlistSeedIds, []),
  filters: defaultFilters,
  wishlistIds: wishlistSeedIds,
  swipedIds: [],
  myStoreListingIds,
  savedOfferIds: savedOfferSeedIds,
  transactions: initialTransactions,
  toggleSavedOffer: (listingId) =>
    set((state) => ({
      savedOfferIds: state.savedOfferIds.includes(listingId)
        ? state.savedOfferIds.filter((id) => id !== listingId)
        : [...state.savedOfferIds, listingId]
    })),
  setRegion: (region) =>
    set((state) => {
      const filters = { ...state.filters, region };
      return {
        filters,
        homeFeed: buildHomeFeed(filters, state.wishlistIds),
        discoveryFeed: computeDiscoveryFeed(state.listings, filters, state.wishlistIds, state.swipedIds)
      };
    }),
  setPlatform: (platform) =>
    set((state) => {
      const filters = { ...state.filters, platform };
      return {
        filters,
        homeFeed: buildHomeFeed(filters, state.wishlistIds),
        discoveryFeed: computeDiscoveryFeed(state.listings, filters, state.wishlistIds, state.swipedIds)
      };
    }),
  setSearchQuery: (searchQuery) =>
    set((state) => {
      const filters = { ...state.filters, searchQuery };
      return {
        filters,
        homeFeed: buildHomeFeed(filters, state.wishlistIds),
        discoveryFeed: computeDiscoveryFeed(state.listings, filters, state.wishlistIds, state.swipedIds)
      };
    }),
  toggleWishlistOnly: () =>
    set((state) => {
      const filters = { ...state.filters, wishlistOnly: !state.filters.wishlistOnly };
      return {
        filters,
        homeFeed: buildHomeFeed(filters, state.wishlistIds),
        discoveryFeed: computeDiscoveryFeed(state.listings, filters, state.wishlistIds, state.swipedIds)
      };
    }),
  toggleWishlist: (listingId) => {
    const premium = usePremiumStore.getState();
    const state = get();
    const alreadySaved = state.wishlistIds.includes(listingId);

    if (!alreadySaved && state.wishlistIds.length >= premium.wishlistLimit) {
      return {
        ok: false,
        message: 'Upgrade to premium for unlimited wishlist capacity.'
      };
    }

    set((current) => {
      const wishlistIds = alreadySaved
        ? current.wishlistIds.filter((id) => id !== listingId)
        : [...current.wishlistIds, listingId];
      return {
        wishlistIds,
        homeFeed: buildHomeFeed(current.filters, wishlistIds),
        discoveryFeed: computeDiscoveryFeed(current.listings, current.filters, wishlistIds, current.swipedIds)
      };
    });

    if (!alreadySaved) {
      useNotificationStore.getState().addNotification({
        type: 'price_drop',
        title: 'Added to Wishlist',
        description: 'We will notify you about price changes for this listing.',
        createdAt: new Date().toISOString(),
        readAt: null,
        listingId
      });
    }

    return { ok: true };
  },
  markStorySeen: (storyId) =>
    set((state) => ({
      stories: state.stories.map((story) =>
        story.id === storyId ? { ...story, isSeen: true } : story
      )
    })),
  addStory: (story) =>
    set((state) => ({
      stories: [story, ...state.stories.filter((item) => !item.isSelf)],
      homeFeed: {
        ...state.homeFeed,
        stories: [story, ...state.stories.filter((item) => !item.isSelf)]
      }
    })),
  swipeListing: (listingId, direction) => {
    const swipedIds = get().swipedIds.includes(listingId)
      ? get().swipedIds
      : [...get().swipedIds, listingId];

    set((state) => ({
      swipedIds,
      discoveryFeed: computeDiscoveryFeed(state.listings, state.filters, state.wishlistIds, swipedIds)
    }));

    if (direction === 'right') {
      return get().toggleWishlist(listingId);
    }
    return { ok: true };
  },
  resetDiscovery: () =>
    set((state) => ({
      swipedIds: [],
      discoveryFeed: computeDiscoveryFeed(state.listings, state.filters, state.wishlistIds, [])
    })),
  addListing: (listing) =>
    set((state) => {
      const listings = [listing, ...state.listings];
      return {
        listings,
        myStoreListingIds: [listing.id, ...state.myStoreListingIds],
        homeFeed: buildHomeFeed(state.filters, state.wishlistIds),
        discoveryFeed: computeDiscoveryFeed(
          listings,
          state.filters,
          state.wishlistIds,
          state.swipedIds
        )
      };
    }),
  updateListing: (listingId, payload) =>
    set((state) => {
      const listings = state.listings.map((item) =>
        item.id === listingId ? { ...item, ...payload } : item
      );
      return {
        listings,
        homeFeed: buildHomeFeed(state.filters, state.wishlistIds),
        discoveryFeed: computeDiscoveryFeed(
          listings,
          state.filters,
          state.wishlistIds,
          state.swipedIds
        )
      };
    }),
  removeListing: (listingId) =>
    set((state) => {
      const listings = state.listings.map((item) =>
        item.id === listingId ? { ...item, status: 'removed' } : item
      );
      return {
        listings,
        myStoreListingIds: state.myStoreListingIds.filter((id) => id !== listingId),
        homeFeed: buildHomeFeed(state.filters, state.wishlistIds),
        discoveryFeed: computeDiscoveryFeed(
          listings,
          state.filters,
          state.wishlistIds,
          state.swipedIds
        )
      };
    }),
  createTransaction: (payload) =>
    set((state) => {
      const listings = state.listings.map((item) =>
        item.id === payload.listingId ? { ...item, status: 'sold' } : item
      );
      return {
        transactions: [
          {
            id: `tx-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...payload
          },
          ...state.transactions
        ],
        listings,
        homeFeed: buildHomeFeed(state.filters, state.wishlistIds),
        discoveryFeed: computeDiscoveryFeed(
          listings,
          state.filters,
          state.wishlistIds,
          state.swipedIds
        )
      };
    })
}));

export const selectListingById = (listingId) =>
  useListingStore.getState().listings.find((item) => item.id === listingId);

export const selectSalesHistory = () =>
  useListingStore.getState().transactions.filter((item) => item.sellerName === 'Marcus V.');

export const selectPurchaseHistory = () =>
  useListingStore.getState().transactions.filter((item) => item.buyerName === 'Marcus V.');

export const selectSavedOffers = () =>
  useListingStore
    .getState()
    .savedOfferIds.map((id) => useListingStore.getState().listings.find((item) => item.id === id))
    .filter(Boolean);

export const selectWishlistListings = () =>
  useListingStore
    .getState()
    .wishlistIds.map((id) => useListingStore.getState().listings.find((item) => item.id === id))
    .filter(Boolean);

export const selectMyListings = () =>
  useListingStore
    .getState()
    .myStoreListingIds.map((id) => useListingStore.getState().listings.find((item) => item.id === id))
    .filter(Boolean);

export default useListingStore;
