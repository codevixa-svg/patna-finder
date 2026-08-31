import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add token
userApi.interceptors.request.use(
  (config) => {
    const userAuth = localStorage.getItem('user-auth-storage');
    if (userAuth) {
      const { state } = JSON.parse(userAuth);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user-auth-storage');
      window.location.href = '/dashboard/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const userAuthApi = {
  register: async (name: string, email: string, password: string, password_confirmation: string, phone?: string) => {
    const response = await userApi.post('/user/register', { 
      name, 
      email, 
      password, 
      password_confirmation,
      phone 
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await userApi.post('/user/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await userApi.post('/user/logout');
    return response.data;
  },

  me: async () => {
    const response = await userApi.get('/user/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => {
    const response = await userApi.post('/user/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await userApi.put('/user/profile', data);
    return response.data;
  },
};

// Dashboard API
export const userDashboardApi = {
  getStats: async () => {
    const response = await userApi.get('/user/dashboard');
    return response.data;
  },

  getQuickStats: async () => {
    const response = await userApi.get('/user/dashboard/quick-stats');
    return response.data;
  },
};

// Business API
export const userBusinessApi = {
  getAll: async () => {
    const response = await userApi.get('/user/businesses');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await userApi.get(`/user/businesses/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await userApi.post('/user/businesses', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await userApi.put(`/user/businesses/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await userApi.delete(`/user/businesses/${id}`);
    return response.data;
  },

  saveDraft: async (data: any) => {
    const response = await userApi.post('/user/businesses/draft', data);
    return response.data;
  },

  // Image upload functions
  uploadImageBase64: async (imageData: string, type: 'logo' | 'cover' | 'gallery') => {
    const response = await userApi.post('/user/upload-image-base64', {
      image: imageData,
      type: type
    });
    return response.data;
  },

  deleteImage: async (path: string) => {
    const response = await userApi.post('/user/delete-image', {
      path: path
    });
    return response.data;
  },
};

// Subscription API
export const userSubscriptionApi = {
  createOrder: async (plan: string) => {
    const response = await userApi.post('/user/subscription/create-order', { plan });
    return response.data;
  },

  verifyPayment: async (razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) => {
    const response = await userApi.post('/user/subscription/verify', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return response.data;
  },

  getCurrentPlan: async () => {
    const response = await userApi.get('/user/subscription/current');
    return response.data;
  },

  cancel: async () => {
    const response = await userApi.post('/user/subscription/cancel');
    return response.data;
  },

  getHistory: async () => {
    const response = await userApi.get('/user/subscription/history');
    return response.data;
  },
};

export default userApi;
