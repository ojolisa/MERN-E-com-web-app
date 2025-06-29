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
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
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

  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
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

  // Admin only
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
  },
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
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  token: tokenUtils,
};

export default api;
