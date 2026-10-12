const STORAGE_KEY = 'lbf_recently_viewed';
const MAX_RECENT_ITEMS = 8;

export const getRecentlyViewed = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read recently viewed from localStorage:', err);
    return [];
  }
};

export const addRecentlyViewed = (business) => {
  if (!business || !business._id) return;
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter((b) => b._id !== business._id);
    const item = {
      _id: business._id,
      name: business.name,
      category: business.category,
      address: business.address,
      images: business.images,
      averageRating: business.averageRating,
      totalReviews: business.totalReviews,
      priceRange: business.priceRange,
      isFeatured: business.isFeatured,
      location: business.location,
    };
    const updated = [item, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save recently viewed to localStorage:', err);
  }
};

export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear recently viewed:', err);
  }
};
