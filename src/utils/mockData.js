const review = (id, reviewerName, rating, comment, createdAt) => ({
  id,
  reviewerName,
  rating,
  comment,
  createdAt
});

const users = {
  marcus: {
    id: 'user-marcus',
    name: 'Marcus V.',
    username: '@marcus_trades',
    avatar: 'https://picsum.photos/seed/user123/200/200',
    location: 'NY, USA',
    region: 'United States',
    rating: 4.9,
    ratingCount: 124,
    verified: true,
    isPremium: false,
    premiumUntil: null,
    responseTime: 'Typically replies in 1 hour',
    bio: 'Collector of RPGs, soulslikes, and premium controllers.',
    badges: ['Verified Seller', 'Fast Responder'],
    reviews: [
      review('rev-1', 'Alex G.', 5, 'Packed everything carefully and replied fast.', '2026-03-09T15:00:00.000Z'),
      review('rev-2', 'Sarah M.', 5, 'Great trade, exactly as described.', '2026-03-05T10:00:00.000Z')
    ]
  },
  alex: {
    id: 'user-alex',
    name: 'Alex G.',
    username: '@alex_g',
    avatar: 'https://picsum.photos/seed/alex/200/200',
    location: 'Queens, USA',
    region: 'United States',
    rating: 4.8,
    ratingCount: 82,
    verified: true,
    isPremium: true,
    premiumUntil: '2026-05-01T00:00:00.000Z',
    responseTime: 'Usually replies in 20 minutes',
    bio: 'Mostly PS5 and JRPG trades.',
    badges: ['Premium', 'Trusted Trader'],
    reviews: [review('rev-4', 'Marcus V.', 5, 'Friendly and on time.', '2026-03-10T12:00:00.000Z')]
  },
  sarah: {
    id: 'user-sarah',
    name: 'Sarah Miller',
    username: '@sarah_m',
    avatar: 'https://picsum.photos/seed/sarah/200/200',
    location: 'Brooklyn, USA',
    region: 'United States',
    rating: 4.7,
    ratingCount: 51,
    verified: true,
    isPremium: false,
    premiumUntil: null,
    responseTime: 'Usually replies in 2 hours',
    bio: 'PlayStation collector and survival-horror fan.',
    badges: ['Verified'],
    reviews: [review('rev-6', 'Marcus V.', 5, 'Easy to negotiate with.', '2026-03-04T13:00:00.000Z')]
  },
  mike: {
    id: 'user-mike',
    name: 'Mike Ross',
    username: '@mike_r',
    avatar: 'https://picsum.photos/seed/mike/200/200',
    location: 'Jersey City, USA',
    region: 'United States',
    rating: 4.6,
    ratingCount: 39,
    verified: true,
    isPremium: false,
    premiumUntil: null,
    responseTime: 'Usually replies in 50 minutes',
    bio: 'Switch and fighting game collector.',
    badges: ['Verified'],
    reviews: [review('rev-7', 'Marcus V.', 4, 'Great trade partner.', '2026-02-28T09:00:00.000Z')]
  },
  jess: {
    id: 'user-jess',
    name: 'Jessica P.',
    username: '@jess_k',
    avatar: 'https://picsum.photos/seed/jess/200/200',
    location: 'Boston, USA',
    region: 'United States',
    rating: 4.9,
    ratingCount: 112,
    verified: true,
    isPremium: true,
    premiumUntil: '2026-04-18T00:00:00.000Z',
    responseTime: 'Usually replies in 30 minutes',
    bio: 'Accessories, premium controllers, and rare imports.',
    badges: ['Premium', 'Top Seller'],
    reviews: [review('rev-8', 'Marcus V.', 5, 'Exactly as shown and fast shipping.', '2026-03-01T09:00:00.000Z')]
  },
  store: {
    id: 'user-store',
    name: 'GamingStore Pro',
    username: '@gamingstore_pro',
    avatar: 'https://picsum.photos/seed/store/200/200',
    location: 'Chicago, USA',
    region: 'United States',
    rating: 5,
    ratingCount: 420,
    verified: true,
    isPremium: true,
    premiumUntil: '2026-06-01T00:00:00.000Z',
    responseTime: 'Usually replies in 10 minutes',
    bio: 'Featured retailer for pre-owned hardware and collector editions.',
    badges: ['Premium', 'Featured Store'],
    reviews: [review('rev-9', 'Marcus V.', 5, 'Fast shipping and spotless item.', '2026-03-08T11:00:00.000Z')]
  }
};

const gallery = (seed, fallback) => [
  fallback,
  `https://picsum.photos/seed/${seed}-1/600/400`,
  `https://picsum.photos/seed/${seed}-2/600/400`,
  `https://picsum.photos/seed/${seed}-3/600/400`
];

const listing = (input) => ({
  id: input.id,
  title: input.title,
  price: input.price,
  originalPrice: input.originalPrice,
  discount: input.discount,
  platform: input.platform,
  imageUrl: input.imageUrl,
  images: gallery(input.id, input.imageUrl),
  description: input.description,
  listingType: input.listingType,
  condition: input.condition || 'Like New',
  region: input.region || users[input.sellerKey].region,
  distance: input.distance || '2.4 miles',
  seller: users[input.sellerKey],
  createdAt: input.createdAt,
  status: 'active',
  isBoosted: Boolean(input.isBoosted),
  boostExpiresAt: input.isBoosted ? '2026-03-30T00:00:00.000Z' : null,
  viewsCount: input.viewsCount || 0,
  wishlistCount: input.wishlistCount || 0,
  isStoryOffer: Boolean(input.isStoryOffer),
  storyDuration: input.storyDuration,
  swapValue: input.swapValue,
  swapRequest: input.swapRequest,
  isBundle: Boolean(input.isBundle),
  bundleItems: input.bundleItems || []
});

export const allListings = [
  listing({ id: '1', title: 'Persona 5 Royal', price: 17.99, originalPrice: 59.99, discount: 70, platform: ['PS5'], imageUrl: 'https://picsum.photos/seed/p5r/400/600', description: 'Award-winning RPG.', listingType: 'sale', sellerKey: 'alex', createdAt: '2026-03-24T18:10:00.000Z', isStoryOffer: true, storyDuration: '12h', isBoosted: true, viewsCount: 1540, wishlistCount: 243 }),
  listing({ id: '2', title: 'Resident Evil 2', price: 9.99, originalPrice: 39.99, discount: 75, platform: ['PS4', 'PS5'], imageUrl: 'https://picsum.photos/seed/re2/400/600', description: 'Raccoon City outbreak.', listingType: 'sale', sellerKey: 'sarah', createdAt: '2026-03-24T17:50:00.000Z', isStoryOffer: true, storyDuration: '4h', viewsCount: 880, wishlistCount: 198 }),
  listing({ id: '3', title: 'Elden Ring', price: 35.99, originalPrice: 59.99, discount: 40, platform: ['PC', 'PS5', 'Xbox'], imageUrl: 'https://picsum.photos/seed/elden/400/600', description: 'Rise, Tarnished.', listingType: 'trade', sellerKey: 'mike', createdAt: '2026-03-24T16:25:00.000Z', isStoryOffer: true, storyDuration: '21h', swapValue: 45, swapRequest: 'Looking for PS5 exclusives or premium gear.', viewsCount: 1624, wishlistCount: 410 }),
  listing({ id: '4', title: 'Cyberpunk 2077', price: 29.99, originalPrice: 49.99, discount: 40, platform: ['PC', 'PS5'], imageUrl: 'https://picsum.photos/seed/cp77/400/600', description: 'Night City, polished edition.', listingType: 'sale', sellerKey: 'alex', createdAt: '2026-03-23T17:00:00.000Z', viewsCount: 621, wishlistCount: 111 }),
  listing({ id: '5', title: 'God of War', price: 19.99, originalPrice: 39.99, discount: 50, platform: ['PS5'], imageUrl: 'https://picsum.photos/seed/gow/400/600', description: 'Open to swaps for newer RPGs.', listingType: 'trade', sellerKey: 'sarah', createdAt: '2026-03-23T12:00:00.000Z', swapValue: 28, swapRequest: 'Open to Spider-Man 2 or FFXVI.', viewsCount: 482, wishlistCount: 90 }),
  listing({ id: '6', title: 'Spider-Man 2', price: 49.99, originalPrice: 69.99, discount: 28, platform: ['PS5'], imageUrl: 'https://picsum.photos/seed/sm2/400/600', description: 'Steelbook sleeve included.', listingType: 'sale', sellerKey: 'store', createdAt: '2026-03-23T09:30:00.000Z', isBoosted: true, viewsCount: 2105, wishlistCount: 515 }),
  listing({ id: '7', title: 'The Last of Us', price: 39.99, originalPrice: 69.99, discount: 42, platform: ['PS5'], imageUrl: 'https://picsum.photos/seed/tlou/400/600', description: 'Collector box in great shape.', listingType: 'trade', sellerKey: 'jess', createdAt: '2026-03-22T17:00:00.000Z', swapValue: 42, swapRequest: 'Looking for PS5 exclusives or high-end headphones.', viewsCount: 730, wishlistCount: 144 }),
  listing({ id: '8', title: 'Final Fantasy VII', price: 44.99, originalPrice: 69.99, discount: 35, platform: ['PS5'], imageUrl: 'https://picsum.photos/seed/ff7/400/600', description: 'Mint disc and soundtrack voucher.', listingType: 'sale', sellerKey: 'alex', createdAt: '2026-03-22T08:00:00.000Z', viewsCount: 534, wishlistCount: 92 }),
  listing({ id: '11', title: 'GTA VI', price: 62.99, originalPrice: 69.99, discount: 10, platform: ['PS5', 'Xbox'], imageUrl: 'https://picsum.photos/seed/gtavi/400/600', description: 'Reservation slot from featured store.', listingType: 'trade', sellerKey: 'store', createdAt: '2026-03-20T20:00:00.000Z', isBoosted: true, viewsCount: 4011, wishlistCount: 960, swapValue: 65, swapRequest: 'Collector trade packages only.' }),
  listing({ id: '12', title: 'Death Stranding 2', price: 62.99, originalPrice: 69.99, discount: 10, platform: ['PS5'], imageUrl: 'https://picsum.photos/seed/ds2/400/600', description: 'Featured launch week preorder.', listingType: 'sale', sellerKey: 'store', createdAt: '2026-03-20T18:40:00.000Z', isBoosted: true, viewsCount: 3350, wishlistCount: 812 }),
  listing({ id: '101', title: 'DualSense Edge', price: 199.99, platform: ['Gear'], imageUrl: 'https://picsum.photos/seed/controller/400/600', description: 'Premium controller with travel case.', listingType: 'sale', sellerKey: 'jess', createdAt: '2026-03-23T14:15:00.000Z', isBoosted: true, viewsCount: 3121, wishlistCount: 522 }),
  listing({ id: '201', title: 'God of War Ragnarok', price: 45, platform: ['PS5'], imageUrl: 'https://picsum.photos/seed/gowr/400/600', description: 'My featured listing with original case.', listingType: 'sale', sellerKey: 'marcus', createdAt: '2026-03-22T12:00:00.000Z', viewsCount: 452, wishlistCount: 34 }),
  listing({ id: '202', title: 'Switch OLED', price: 280, platform: ['Switch'], imageUrl: 'https://picsum.photos/seed/switch/400/600', description: 'Console bundle with dock and sleeve.', listingType: 'sale', sellerKey: 'marcus', createdAt: '2026-03-18T12:00:00.000Z', isBoosted: true, isBundle: true, bundleItems: [{ id: 'bundle-1', title: 'Switch OLED', price: 250, platform: ['Switch'] }, { id: 'bundle-2', title: 'Travel Sleeve', price: 30, platform: ['Gear'] }], viewsCount: 870, wishlistCount: 57 }),
  listing({ id: '203', title: 'Zelda: TOTK', price: 55, platform: ['Switch'], imageUrl: 'https://picsum.photos/seed/zelda/400/600', description: 'Launch edition.', listingType: 'trade', sellerKey: 'marcus', createdAt: '2026-03-16T12:00:00.000Z', swapValue: 60, swapRequest: 'Looking for FFVII Rebirth or Spider-Man 2.', viewsCount: 311, wishlistCount: 19 }),
  listing({ id: '204', title: 'PS5 Controller', price: 40, platform: ['Gear'], imageUrl: 'https://picsum.photos/seed/controller-blue/400/600', description: 'Midnight black DualSense with low hours.', listingType: 'sale', sellerKey: 'marcus', createdAt: '2026-03-14T12:00:00.000Z', viewsCount: 210, wishlistCount: 12 })
];

export const listingIndex = Object.fromEntries(allListings.map((item) => [item.id, item]));
const pick = (ids) => ids.map((id) => listingIndex[id]).filter(Boolean);

export const storyFeed = [
  { id: 'story-self', username: 'Your Story', avatar: users.marcus.avatar, offerImage: '', offerTitle: '', offerPrice: 0, isSeen: false, isSelf: true, listingId: null, expiresAt: '2026-03-25T18:00:00.000Z' },
  { id: 'story-1', username: 'alex_g', avatar: users.alex.avatar, offerImage: listingIndex['1'].imageUrl, offerTitle: listingIndex['1'].title, offerPrice: listingIndex['1'].price, isSeen: false, listingId: '1', expiresAt: '2026-03-25T06:00:00.000Z' },
  { id: 'story-2', username: 'sarah_m', avatar: users.sarah.avatar, offerImage: listingIndex['2'].imageUrl, offerTitle: listingIndex['2'].title, offerPrice: listingIndex['2'].price, isSeen: false, listingId: '2', expiresAt: '2026-03-25T03:00:00.000Z' },
  { id: 'story-3', username: 'mike_r', avatar: users.mike.avatar, offerImage: listingIndex['3'].imageUrl, offerTitle: listingIndex['3'].title, offerPrice: listingIndex['3'].price, isSeen: true, listingId: '3', expiresAt: '2026-03-25T09:00:00.000Z' }
];

export const supportedRegions = ['Global Arena', 'United States', 'United Kingdom', 'Bosnia and Herzegovina', 'Croatia', 'Serbia', 'Germany', 'France', 'Italy', 'Japan', 'Canada', 'Australia'];
export const platformFilters = ['PS4', 'PS5', 'Xbox', 'PC', 'Steam', 'Switch', 'Gear'];
export const defaultFilters = { region: 'Global Arena', platform: null, wishlistOnly: false, searchQuery: '' };
export const wishlistSeedIds = ['1', '3'];
export const savedOfferSeedIds = ['11', '12'];
export const myStoreListingIds = ['201', '202', '203', '204'];

export const applyListingFilters = (collection, filters, wishlistIds) =>
  collection.filter((item) => {
    const regionMatch = filters.region === 'Global Arena' || item.region.toLowerCase().includes(filters.region.toLowerCase());
    const platformMatch = !filters.platform || item.platform.includes(filters.platform);
    const wishlistMatch = !filters.wishlistOnly || wishlistIds.includes(item.id);
    const searchMatch = !filters.searchQuery || `${item.title} ${item.description}`.toLowerCase().includes(filters.searchQuery.toLowerCase());
    return regionMatch && platformMatch && wishlistMatch && searchMatch;
  });

export const buildHomeFeed = (filters = defaultFilters, wishlistIds = wishlistSeedIds) => ({
  stories: storyFeed,
  communityOffers: applyListingFilters(pick(['1', '2', '5', '101']), filters, wishlistIds).slice(0, 4),
  todayInStore: applyListingFilters(pick(['1', '2', '3', '4', '5', '6', '7', '8']), filters, wishlistIds).slice(0, 8),
  mostWanted: applyListingFilters(pick(['11', '12']), filters, wishlistIds).slice(0, 4)
});

export const buildDiscoveryFeed = (filters = defaultFilters, wishlistIds = wishlistSeedIds, swipedIds = []) =>
  applyListingFilters(pick(['1', '2', '3', '101', '201', '202']), filters, wishlistIds)
    .filter((item) => !swipedIds.includes(item.id))
    .filter((item) => !myStoreListingIds.includes(item.id))
    .filter((item) => item.status === 'active');

export const searchListings = (query, collection = allListings) => {
  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) {
    return collection;
  }
  return collection.filter((item) =>
    [item.title, item.description, item.platform.join(' '), item.seller.name, item.region]
      .join(' ')
      .toLowerCase()
      .includes(normalized)
  );
};

export const initialTransactions = [
  { id: 'tx-sale-1', listingId: '3', listingTitle: 'Elden Ring (PS5)', imageUrl: 'https://picsum.photos/seed/elden/300/300', buyerName: 'Alex G.', sellerName: 'Marcus V.', agreedPrice: 35, status: 'completed', createdAt: '2026-03-22T16:00:00.000Z' },
  { id: 'tx-sale-2', listingId: '101', listingTitle: 'DualSense Edge', imageUrl: 'https://picsum.photos/seed/controller/300/300', buyerName: 'Sarah Miller', sellerName: 'Marcus V.', agreedPrice: 180, status: 'completed', createdAt: '2026-03-17T14:00:00.000Z' },
  { id: 'tx-purchase-1', listingId: '6', listingTitle: 'Spider-Man 2', imageUrl: 'https://picsum.photos/seed/spidey/300/300', buyerName: 'Marcus V.', sellerName: 'GamingStore Pro', agreedPrice: 50, status: 'accepted', createdAt: '2026-03-23T10:00:00.000Z' }
];

export const initialNotifications = [
  { id: 'notif-1', type: 'price_drop', title: 'Price Drop!', description: 'Persona 5 Royal is now $17.99', createdAt: '2026-03-24T17:30:00.000Z', readAt: null, listingId: '1' },
  { id: 'notif-2', type: 'message', title: 'New Message', description: 'Alex G. sent you a message', createdAt: '2026-03-24T15:00:00.000Z', readAt: null, conversationId: 'chat-alex' },
  { id: 'notif-3', type: 'offer', title: 'Trade Offer', description: 'Someone wants your Elden Ring', createdAt: '2026-03-23T14:00:00.000Z', readAt: '2026-03-23T15:00:00.000Z', listingId: '3' },
  { id: 'notif-4', type: 'story', title: 'New Story', description: 'Jess posted a flash sale story', createdAt: '2026-03-23T10:00:00.000Z', readAt: null, listingId: '101' },
  { id: 'notif-5', type: 'premium_expiring', title: 'Premium Expires Soon', description: 'Upgrade now to unlock boosted listings and analytics.', createdAt: '2026-03-22T10:00:00.000Z', readAt: '2026-03-22T11:00:00.000Z' }
];

export const initialConversations = [
  { id: 'chat-alex', listingId: '3', participant: users.alex, lastMessage: 'Would you take $30 for it?', lastMessageAt: '2026-03-24T20:28:00.000Z', unreadCount: 1, online: true, messages: [{ id: 'msg-1', senderId: users.alex.id, text: 'Hi, is the Elden Ring still available?', type: 'text', createdAt: '2026-03-24T20:20:00.000Z', isRead: true }, { id: 'msg-2', senderId: users.marcus.id, text: 'Yes, it is!', type: 'text', createdAt: '2026-03-24T20:22:00.000Z', isRead: true }, { id: 'msg-3', senderId: users.alex.id, text: 'Would you take $30 for it?', type: 'offer', offerListingId: '3', createdAt: '2026-03-24T20:28:00.000Z', isRead: false }] },
  { id: 'chat-sarah', listingId: '5', participant: users.sarah, lastMessage: 'I can trade my PS5 controller for it.', lastMessageAt: '2026-03-24T18:00:00.000Z', unreadCount: 0, online: false, messages: [{ id: 'msg-4', senderId: users.sarah.id, text: 'Hey, saw your listing for God of War.', type: 'text', createdAt: '2026-03-23T18:00:00.000Z', isRead: true }, { id: 'msg-5', senderId: users.sarah.id, text: 'I can trade my PS5 controller for it.', type: 'offer', offerListingId: '204', createdAt: '2026-03-24T18:00:00.000Z', isRead: true }] },
  { id: 'chat-store', listingId: '6', participant: users.store, lastMessage: 'Your order #1234 has been shipped!', lastMessageAt: '2026-03-24T17:00:00.000Z', unreadCount: 0, online: true, messages: [{ id: 'msg-6', senderId: users.store.id, text: 'Your order #1234 has been shipped!', type: 'text', createdAt: '2026-03-24T17:00:00.000Z', isRead: true }] }
];

export const currentUser = users.marcus;
export const getListingById = (listingId) => listingIndex[listingId];
export const getConversationById = (conversationId) => initialConversations.find((conversation) => conversation.id === conversationId);
export const selectMyListings = () => pick(myStoreListingIds);
