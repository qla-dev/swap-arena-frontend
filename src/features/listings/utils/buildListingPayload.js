const buildImages = (seed, fallback) => [
  fallback,
  `https://picsum.photos/seed/${seed}-a/600/400`,
  `https://picsum.photos/seed/${seed}-b/600/400`,
  `https://picsum.photos/seed/${seed}-c/600/400`
];

export const buildListingPayload = ({ form, user, existing }) => {
  const seed = String(form.title || existing?.title || Date.now())
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  const imageUrl = existing?.imageUrl || `https://picsum.photos/seed/${seed}/400/600`;

  return {
    ...existing,
    id: existing?.id || `listing-${Date.now()}`,
    title: form.title,
    description: form.description,
    price: Number(form.price || 0),
    originalPrice: existing?.originalPrice || Number(form.price || 0),
    discount: existing?.discount || 0,
    platform: form.platform,
    imageUrl,
    images: existing?.images || buildImages(seed, imageUrl),
    listingType: form.listingType,
    condition: form.condition,
    region: user?.region || existing?.region || 'United States',
    distance: existing?.distance || '1.1 miles',
    seller: user || existing?.seller,
    createdAt: existing?.createdAt || new Date().toISOString(),
    status: existing?.status || 'active',
    isBoosted: Boolean(form.isBoosted),
    boostExpiresAt: form.isBoosted
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null,
    viewsCount: existing?.viewsCount || 0,
    wishlistCount: existing?.wishlistCount || 0,
    isStoryOffer: existing?.isStoryOffer || false,
    storyDuration: existing?.storyDuration || null,
    swapValue: form.listingType === 'trade' ? Number(form.price || 0) : null,
    swapRequest:
      form.listingType === 'trade'
        ? existing?.swapRequest || 'Open to fair swaps for current-gen exclusives and premium gear.'
        : null,
    isBundle: existing?.isBundle || false,
    bundleItems: existing?.bundleItems || []
  };
};

export default buildListingPayload;
