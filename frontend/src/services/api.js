// API Base Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong');
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Generic HTTP methods
const httpMethods = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (endpoint, data) => apiRequest(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

// Auth API
export const authAPI = {
  register: (userData) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: () => 
    apiRequest('/auth/me'),

  updateProfile: (userData) => 
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  changePassword: (passwordData) => 
    apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),

  updatePreferences: (preferences) => 
    apiRequest('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),

  deleteAccount: () => 
    apiRequest('/auth/delete-account', {
      method: 'DELETE',
    }),

  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },

  // Admin methods
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/auth/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  getUserStats: () => 
    apiRequest('/auth/admin/users/stats'),

  getUserAnalytics: () => 
    apiRequest('/auth/admin/analytics/users'),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => 
    apiRequest(`/products/${id}`),

  create: (productData) => 
    apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  update: (id, productData) => 
    apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  delete: (id) => 
    apiRequest(`/products/${id}`, {
      method: 'DELETE',
    }),

  getCategories: () => 
    apiRequest('/products/categories'),

  // Admin methods
  getStats: () => 
    apiRequest('/products/admin/stats'),

  getAdminCategories: () => 
    apiRequest('/products/admin/categories'),

  getInventoryAlerts: () => 
    apiRequest('/products/admin/inventory/alerts'),

  getTopProducts: () => 
    apiRequest('/products/admin/analytics/top'),
};

// Orders API
export const ordersAPI = {
  getMyOrders: () => 
    apiRequest('/orders/my-orders'),

  getById: (id) => 
    apiRequest(`/orders/${id}`),

  create: (orderData) => 
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  updateStatus: (id, status) => 
    apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Admin methods
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders/admin/all${queryString ? `?${queryString}` : ''}`);
  },

  getStats: () => 
    apiRequest('/orders/admin/stats'),

  getAnalytics: () => 
    apiRequest('/orders/admin/analytics'),

  getSalesAnalytics: () => 
    apiRequest('/orders/admin/analytics/sales'),

  getRevenueAnalytics: () => 
    apiRequest('/orders/admin/analytics/revenue'),

  getRecent: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders/admin/recent${queryString ? `?${queryString}` : ''}`);
  },

  exportReports: () => 
    apiRequest('/orders/admin/reports/export'),
};

// Cart API
export const cartAPI = {
  addToCart: (productId, quantity = 1) => 
    apiRequest('/auth/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  removeFromCart: (productId) => 
    apiRequest(`/auth/cart/${productId}`, {
      method: 'DELETE',
    }),

  updateQuantity: (productId, quantity) => 
    apiRequest(`/auth/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  clearCart: () => 
    apiRequest('/auth/cart', {
      method: 'DELETE',
    }),

  getCart: () => 
    apiRequest('/auth/me').then(data => data.user.cart || []),
};

// Token management utilities
export const tokenUtils = {
  save: (token) => localStorage.setItem('token', token),
  get: () => localStorage.getItem('token'),
  remove: () => localStorage.removeItem('token'),
  isValid: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },
};

// Default export for convenience
const api = {
  // Generic HTTP methods
  get: httpMethods.get,
  post: httpMethods.post,
  put: httpMethods.put,
  delete: httpMethods.delete,
  
  // Specific API modules
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  cart: cartAPI,
  token: tokenUtils,
};

export default api;
