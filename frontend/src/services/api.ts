import axios from 'axios';
import { Product, User, Order } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    api.post('/api/auth/register', { name, email, password }),
  
  getProfile: () => api.get('/api/auth/me'),
  
  updateProfile: (userData: Partial<User>) =>
    api.put('/api/auth/profile', userData),
  
  // User state management
  updatePreferences: (preferences: Partial<User['preferences']>) =>
    api.put('/api/auth/preferences', preferences),
  
  // Cart management
  addToCart: (productId: string, quantity: number) =>
    api.post('/api/auth/cart/add', { productId, quantity }),
  
  removeFromCart: (productId: string) =>
    api.delete(`/api/auth/cart/${productId}`),
  
  updateCartQuantity: (productId: string, quantity: number) =>
    api.put(`/api/auth/cart/${productId}`, { quantity }),
  
  clearCart: () => api.delete('/api/auth/cart'),
  
  // Saved items
  saveItem: (productId: string) =>
    api.post(`/api/auth/saved/${productId}`),
  
  unsaveItem: (productId: string) =>
    api.delete(`/api/auth/saved/${productId}`),
  
  // Recently viewed
  addToRecentlyViewed: (productId: string) =>
    api.post(`/api/auth/viewed/${productId}`),
  
  // Search history
  addToSearchHistory: (query: string) =>
    api.post('/api/auth/search', { query }),

  // Admin user management
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get('/api/auth/admin/users', { params }),
  
  getUserStats: () => api.get('/api/auth/admin/users/stats'),
  
  updateUserRole: (userId: string, role: string) =>
    api.put(`/api/auth/admin/users/${userId}/role`, { role }),
  
  deleteUser: (userId: string) => api.delete(`/api/auth/admin/users/${userId}`),
};

// Products API
export const productsAPI = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => api.get('/api/products', { params }),
  
  getProduct: (id: string) => api.get(`/api/products/${id}`),
  
  getFeaturedProducts: () => api.get('/api/products/featured'),
  
  getCategories: () => api.get('/api/products/categories'),
  
  addReview: (productId: string, rating: number, comment: string) =>
    api.post(`/api/products/${productId}/reviews`, { rating, comment }),
  
  // Admin only
  createProduct: (productData: Partial<Product>) =>
    api.post('/api/products', productData),
  
  updateProduct: (id: string, productData: Partial<Product>) =>
    api.put(`/api/products/${id}`, productData),
  
  deleteProduct: (id: string) => api.delete(`/api/products/${id}`),

  // Admin category management
  getCategoryStats: () => api.get('/api/products/admin/categories'),
  
  updateCategoryName: (oldName: string, newName: string) =>
    api.put(`/api/products/admin/categories/${encodeURIComponent(oldName)}/${encodeURIComponent(newName)}`),
  
  // Inventory alerts
  getInventoryAlerts: () => api.get('/api/products/admin/inventory/alerts'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData: {
    items: { product: string; quantity: number }[];
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: string;
  }) => api.post('/api/orders', orderData),
  
  getMyOrders: () => api.get('/api/orders/my-orders'),
  
  getOrder: (id: string) => api.get(`/api/orders/${id}`),
  
  cancelOrder: (id: string) => api.put(`/api/orders/${id}/cancel`),
  
  // Admin only
  getAllOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/api/orders', { params }),
  
  updateOrderStatus: (id: string, orderStatus: string, trackingNumber?: string) =>
    api.put(`/api/orders/${id}/status`, { orderStatus, trackingNumber }),

  // Admin analytics and reports
  getAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/api/orders/admin/analytics', { params }),
  
  exportReport: (type: 'orders' | 'products' | 'users', params?: { startDate?: string; endDate?: string }) =>
    api.get('/api/orders/admin/reports/export', { params: { type, ...params } }),
};

export default api;
