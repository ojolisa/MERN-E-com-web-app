export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  avatar?: string;
  preferences?: {
    currency: string;
    language: string;
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      promotions: boolean;
      orderUpdates: boolean;
    };
    categories: string[];
  };
  cart?: CartItem[];
  savedItems?: SavedItem[];
  recentlyViewed?: RecentlyViewedItem[];
  searchHistory?: SearchHistoryItem[];
  lastLogin?: string;
  loginCount?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface SavedItem {
  productId: Product;
  savedAt: string;
}

export interface RecentlyViewedItem {
  productId: Product;
  viewedAt: string;
}

export interface SearchHistoryItem {
  query: string;
  searchedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  images: {
    url: string;
    alt: string;
  }[];
  stock: number;
  specifications?: Record<string, string>;
  rating: {
    average: number;
    count: number;
  };
  reviews: Review[];
  isActive: boolean;
  tags: string[];
  discountPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string | {
    _id: string;
    name: string;
    email: string;
  };
  items: {
    product: string;
    quantity: number;
    price: number;
    name: string;
    image: string;
  }[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingCost: number;
  tax: number;
  discount: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  finalTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  saveUserState: () => Promise<void>;
  restoreUserState: () => Promise<void>;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  syncWithServer: () => Promise<void>;
}

export interface UserStateContextType {
  savedItems: SavedItem[];
  recentlyViewed: RecentlyViewedItem[];
  searchHistory: SearchHistoryItem[];
  addToSaved: (productId: string) => Promise<void>;
  removeFromSaved: (productId: string) => Promise<void>;
  addToRecentlyViewed: (productId: string) => Promise<void>;
  addToSearchHistory: (query: string) => Promise<void>;
  clearSearchHistory: () => void;
}
