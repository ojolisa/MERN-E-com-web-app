import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authAPI.getProfile();
          const userData = response.data.user;
          setUser(userData);
          setToken(storedToken);
          
          // Restore user state to localStorage for offline access
          if (userData.preferences) {
            localStorage.setItem('userPreferences', JSON.stringify(userData.preferences));
          }
          if (userData.searchHistory) {
            localStorage.setItem('searchHistory', JSON.stringify(userData.searchHistory));
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('userPreferences');
          localStorage.removeItem('searchHistory');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(name, email, password);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('searchHistory');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    try {
      await authAPI.updatePreferences(preferences);
      if (user) {
        const updatedUser: User = {
          ...user,
          preferences: { 
            currency: 'USD',
            language: 'en',
            theme: 'light',
            notifications: {
              email: true,
              promotions: true,
              orderUpdates: true
            },
            categories: [],
            ...user.preferences,
            ...preferences
          }
        };
        setUser(updatedUser);
        localStorage.setItem('userPreferences', JSON.stringify(updatedUser.preferences));
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  };

  const saveUserState = async () => {
    // This method can be used to manually sync state with server
    try {
      if (user) {
        const response = await authAPI.getProfile();
        const userData = response.data.user;
        setUser(userData);
        
        if (userData.preferences) {
          localStorage.setItem('userPreferences', JSON.stringify(userData.preferences));
        }
        if (userData.searchHistory) {
          localStorage.setItem('searchHistory', JSON.stringify(userData.searchHistory));
        }
      }
    } catch (error: any) {
      console.error('Failed to sync user state:', error);
    }
  };

  const restoreUserState = async () => {
    // Restore state from localStorage if available
    try {
      const storedPreferences = localStorage.getItem('userPreferences');
      const storedSearchHistory = localStorage.getItem('searchHistory');
      
      if (user && storedPreferences) {
        const preferences = JSON.parse(storedPreferences);
        setUser(prev => prev ? { ...prev, preferences } : null);
      }
      
      if (user && storedSearchHistory) {
        const searchHistory = JSON.parse(storedSearchHistory);
        setUser(prev => prev ? { ...prev, searchHistory } : null);
      }
    } catch (error) {
      console.error('Failed to restore user state:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    updatePreferences,
    saveUserState,
    restoreUserState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
