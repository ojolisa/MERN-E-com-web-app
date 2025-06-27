import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, CartContextType, Product } from '../types';
import { authAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user, token } = useAuth();

  // Load cart from localStorage or server on mount
  useEffect(() => {
    if (user && token) {
      // If user is logged in, use server cart
      syncWithServer();
    } else {
      // If not logged in, use localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, [user, token]);

  // Save cart to localStorage whenever cart changes (for non-logged-in users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const syncWithServer = async () => {
    if (user && token) {
      try {
        // Get updated user data which includes cart
        const response = await authAPI.getProfile();
        const userData = response.data.user;
        if (userData.cart) {
          // Convert server cart format to frontend format
          const serverCart: CartItem[] = userData.cart.map((item: any) => ({
            product: item.productId,
            quantity: item.quantity
          }));
          setCart(serverCart);
        }
      } catch (error) {
        console.error('Failed to sync cart with server:', error);
      }
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (user && token) {
      // If logged in, update server cart
      try {
        await authAPI.addToCart(product._id, quantity);
        await syncWithServer();
      } catch (error) {
        console.error('Failed to add to server cart:', error);
        // Fallback to local cart
        addToLocalCart(product, quantity);
      }
    } else {
      // If not logged in, update local cart
      addToLocalCart(product, quantity);
    }
  };

  const addToLocalCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product._id === product._id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const removeFromCart = async (productId: string) => {
    if (user && token) {
      try {
        await authAPI.removeFromCart(productId);
        await syncWithServer();
      } catch (error) {
        console.error('Failed to remove from server cart:', error);
        // Fallback to local cart
        setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
      }
    } else {
      setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user && token) {
      try {
        await authAPI.updateCartQuantity(productId, quantity);
        await syncWithServer();
      } catch (error) {
        console.error('Failed to update server cart:', error);
        // Fallback to local cart
        updateLocalQuantity(productId, quantity);
      }
    } else {
      updateLocalQuantity(productId, quantity);
    }
  };

  const updateLocalQuantity = (productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = async () => {
    if (user && token) {
      try {
        await authAPI.clearCart();
        setCart([]);
      } catch (error) {
        console.error('Failed to clear server cart:', error);
        // Fallback to local cart
        setCart([]);
      }
    } else {
      setCart([]);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    syncWithServer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
