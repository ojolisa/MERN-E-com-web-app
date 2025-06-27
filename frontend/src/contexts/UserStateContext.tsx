import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SavedItem, RecentlyViewedItem, SearchHistoryItem, UserStateContextType } from '../types';
import { authAPI } from '../services/api';
import { useAuth } from './AuthContext';

const UserStateContext = createContext<UserStateContextType | undefined>(undefined);

export const useUserState = () => {
  const context = useContext(UserStateContext);
  if (context === undefined) {
    throw new Error('useUserState must be used within a UserStateProvider');
  }
  return context;
};

interface UserStateProviderProps {
  children: ReactNode;
}

export const UserStateProvider: React.FC<UserStateProviderProps> = ({ children }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const { user, token } = useAuth();

  // Load user state from localStorage or server on mount
  useEffect(() => {
    if (user && token) {
      // Load from user data
      if (user.savedItems) setSavedItems(user.savedItems);
      if (user.recentlyViewed) setRecentlyViewed(user.recentlyViewed);
      if (user.searchHistory) setSearchHistory(user.searchHistory);
    } else {
      // Load from localStorage
      const localSavedItems = localStorage.getItem('savedItems');
      const localRecentlyViewed = localStorage.getItem('recentlyViewed');
      const localSearchHistory = localStorage.getItem('searchHistory');

      if (localSavedItems) {
        try {
          setSavedItems(JSON.parse(localSavedItems));
        } catch (error) {
          console.error('Error loading saved items from localStorage:', error);
        }
      }

      if (localRecentlyViewed) {
        try {
          setRecentlyViewed(JSON.parse(localRecentlyViewed));
        } catch (error) {
          console.error('Error loading recently viewed from localStorage:', error);
        }
      }

      if (localSearchHistory) {
        try {
          setSearchHistory(JSON.parse(localSearchHistory));
        } catch (error) {
          console.error('Error loading search history from localStorage:', error);
        }
      }
    }
  }, [user, token]);

  // Save to localStorage for non-logged-in users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('savedItems', JSON.stringify(savedItems));
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  }, [savedItems, recentlyViewed, searchHistory, user]);

  const addToSaved = async (productId: string) => {
    if (user && token) {
      try {
        await authAPI.saveItem(productId);
        // Refresh user data to get updated saved items
        // This could be optimized by updating local state directly
      } catch (error) {
        console.error('Failed to save item on server:', error);
      }
    } else {
      // Add to local storage for non-logged-in users
      const newSavedItem: SavedItem = {
        productId: { _id: productId } as any, // Simplified for localStorage
        savedAt: new Date().toISOString()
      };
      setSavedItems(prev => {
        if (prev.some(item => item.productId._id === productId)) {
          return prev; // Already saved
        }
        return [newSavedItem, ...prev];
      });
    }
  };

  const removeFromSaved = async (productId: string) => {
    if (user && token) {
      try {
        await authAPI.unsaveItem(productId);
        setSavedItems(prev => prev.filter(item => item.productId._id !== productId));
      } catch (error) {
        console.error('Failed to unsave item on server:', error);
      }
    } else {
      setSavedItems(prev => prev.filter(item => item.productId._id !== productId));
    }
  };

  const addToRecentlyViewed = async (productId: string) => {
    if (user && token) {
      try {
        await authAPI.addToRecentlyViewed(productId);
      } catch (error) {
        console.error('Failed to add to recently viewed on server:', error);
      }
    } else {
      const newViewedItem: RecentlyViewedItem = {
        productId: { _id: productId } as any, // Simplified for localStorage
        viewedAt: new Date().toISOString()
      };
      setRecentlyViewed(prev => {
        // Remove if already exists
        const filtered = prev.filter(item => item.productId._id !== productId);
        // Add to beginning
        const updated = [newViewedItem, ...filtered];
        // Keep only last 20 items
        return updated.slice(0, 20);
      });
    }
  };

  const addToSearchHistory = async (query: string) => {
    if (!query.trim()) return;

    if (user && token) {
      try {
        await authAPI.addToSearchHistory(query);
      } catch (error) {
        console.error('Failed to save search history on server:', error);
      }
    } else {
      const newSearchItem: SearchHistoryItem = {
        query: query.trim(),
        searchedAt: new Date().toISOString()
      };
      setSearchHistory(prev => {
        // Remove if already exists
        const filtered = prev.filter(item => item.query !== query);
        // Add to beginning
        const updated = [newSearchItem, ...filtered];
        // Keep only last 10 searches
        return updated.slice(0, 10);
      });
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    if (!user) {
      localStorage.removeItem('searchHistory');
    }
  };

  const value: UserStateContextType = {
    savedItems,
    recentlyViewed,
    searchHistory,
    addToSaved,
    removeFromSaved,
    addToRecentlyViewed,
    addToSearchHistory,
    clearSearchHistory,
  };

  return <UserStateContext.Provider value={value}>{children}</UserStateContext.Provider>;
};
