import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = sessionStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
          });
          sessionStorage.setItem('access_token', response.data.access);
          return api.request(error.config);
        } catch (refreshError) {
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  forgotPassword: (data) => api.post('/auth/forgot-password/', data),
  verifyOtp: (data) => api.post('/auth/verify-otp/', data),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  logout: () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
  }
};

export const productsAPI = {
  getAll: (params) => api.get('/products/', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}/`),
  getCategories: () => api.get('/categories/'),
};

export const cartAPI = {
  get: () => api.get('/cart/'),
  add: (productId) => api.post(`/cart/add/${productId}/`),
  update: (itemId, quantity) => api.put(`/cart/update/${itemId}/`, { quantity }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}/`),
};

export const wishlistAPI = {
  get: () => api.get('/wishlist/'),
  add: (productId) => api.post(`/wishlist/add/${productId}/`),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}/`),
};

export const ordersAPI = {
  checkout: (data) => api.post('/checkout/', data),
  getHistory: () => api.get('/orders/'),
  getDetail: (orderId) => api.get(`/orders/${orderId}/`),
  cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel/`),
  updatePaymentStatus: (orderId, status) => api.post(`/orders/${orderId}/payment/`, { payment_status: status }),
  downloadInvoice: (orderId) => api.get(`/orders/${orderId}/invoice/`, { responseType: 'blob' }),
  getFirstOrderDiscount: () => api.get('/first-order-discount/'),
};

export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/products/${productId}/reviews/`),
  add: (productId, data) => api.post(`/products/${productId}/reviews/add/`, data),
};

export const userAPI = {
  getProfile: () => api.get('/profile/'),
  updateProfile: (data) => api.put('/profile/', data),
  getAnalytics: () => api.get('/analytics/'),
};

export const mlAPI = {
  getRecommendations: (model = 'knn', limit = 6) => 
    api.get('/recommendations/', { params: { model, limit } }),
  getMlDashboard: () => api.get('/admin/ml-dashboard/'),
  getAdminStats: () => api.get('/admin/stats/'),
  getMostOrderedProducts: (limit = 6) => api.get('/most-ordered-products/', { params: { limit } }),
};

export const roomAIAPI = {
  analyzeRoom: (formData) => api.post('/ai/room-analyze/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const adminAPI = {
  // Products
  createProduct: (data) => api.post('/admin/products/create/', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}/update/`, data),
  getProducts: () => api.get('/admin/products/'),
  deleteProduct: (id) => api.delete(`/admin/products/${id}/delete/`),
  
  // Users
  getUsers: () => api.get('/admin/users/'),
  createUser: (data) => api.post('/admin/users/create/', data),
  banUser: (id) => api.put(`/admin/users/${id}/ban/`),
  updateUser: (id, data) => api.put(`/admin/users/${id}/update/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/delete/`),
  removeWishlist: (id) => api.delete(`/admin/wishlists/${id}/delete/`),
  
  // Orders
  getOrders: () => api.get('/admin/orders/'),
  updateOrderStatus: (id, status, paymentStatus) => api.put(`/admin/orders/${id}/status/`, { 
    status, 
    payment_status: paymentStatus 
  }),
  deleteOrder: (id) => api.delete(`/admin/orders/${id}/delete/`),
  
  // Wishlists
  getWishlists: () => api.get('/admin/wishlists/'),

  // Vendors
  getVendors: () => api.get('/admin/vendors/'),
  approveVendor: (id, status) => api.put(`/admin/vendors/${id}/approve/`, { status }),
};

export const vendorAPI = {
  // Registration & Profile
  register: (data) => api.post('/vendor/register/', data),
  getProfile: () => api.get('/vendor/profile/'),
  updateProfile: (data) => api.put('/vendor/profile/', data),

  // Products
  getProducts: () => api.get('/vendor/products/'),
  createProduct: (data) => api.post('/vendor/products/create/', data),
  updateProduct: (id, data) => api.put(`/vendor/products/${id}/update/`, data),
  deleteProduct: (id) => api.delete(`/vendor/products/${id}/delete/`),

  // Orders & Stats
  getOrders: () => api.get('/vendor/orders/'),
  getStats: () => api.get('/vendor/stats/'),
};

export default api;

