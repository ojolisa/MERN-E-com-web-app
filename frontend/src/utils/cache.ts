// Cache management utility for featured products
export const featuredProductsCache = {
  // Clear the featured products cache
  clear: () => {
    localStorage.removeItem('featuredProducts');
    localStorage.removeItem('featuredProductsTimestamp');
  },

  // Check if cache is stale
  isStale: (maxAgeMs: number = 5 * 60 * 1000): boolean => {
    const timestamp = localStorage.getItem('featuredProductsTimestamp');
    if (!timestamp) return true;
    
    return Date.now() - parseInt(timestamp) > maxAgeMs;
  },

  // Get cached data if available and not stale
  get: () => {
    const cachedData = localStorage.getItem('featuredProducts');
    const cachedTimestamp = localStorage.getItem('featuredProductsTimestamp');
    
    if (!cachedData || !cachedTimestamp) return null;
    
    if (featuredProductsCache.isStale()) {
      featuredProductsCache.clear();
      return null;
    }
    
    try {
      return JSON.parse(cachedData);
    } catch {
      featuredProductsCache.clear();
      return null;
    }
  },

  // Set cache data
  set: (data: any) => {
    localStorage.setItem('featuredProducts', JSON.stringify(data));
    localStorage.setItem('featuredProductsTimestamp', Date.now().toString());
  }
};
