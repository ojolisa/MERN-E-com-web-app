import { useState, useEffect } from 'react';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { featuredProductsCache } from '../utils/cache';

interface UseFeaturedProductsReturn {
  products: Product[];
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export const useFeaturedProducts = (): UseFeaturedProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check cache first
      const cachedProducts = featuredProductsCache.get();
      if (cachedProducts) {
        setProducts(cachedProducts);
        setLoading(false);
        return;
      }

      const response = await productsAPI.getFeaturedProducts();
      setProducts(response.data);
      
      // Update cache
      featuredProductsCache.set(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load featured products';
      setError(errorMessage);
      console.error('Error fetching featured products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchFeaturedProducts
  };
};
