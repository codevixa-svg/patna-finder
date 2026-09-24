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

  /** AWS Cognito MFA step 2: verify OTP/TOTP with the challenge token */
  verifyMfa: async (challengeToken: string, code: string) => {
    const response = await userApi.post('/user/verify-mfa', {
      challenge_token: challengeToken,
      code,
    });
    return response.data;
  },

  /** Resend the email OTP for an active MFA challenge */
  resendMfa: async (challengeToken: string) => {
    const response = await userApi.post('/user/resend-mfa', {
      challenge_token: challengeToken,
    });
    return response.data;
  },

  /** OTP-ONLY LOGIN: Request OTP to email (no password required) */
  loginWithOtp: async (email: string, password: string) => {
    const response = await userApi.post('/user/login-with-otp', { email, password });
    return response.data;
  },

  /** Verify OTP and login */
  verifyOtp: async (challengeToken: string, code: string) => {
    const response = await userApi.post('/user/verify-otp', {
      challenge_token: challengeToken,
      code,
    });
    return response.data;
  },

  /** Resend OTP for OTP-only login */
  resendOtp: async (challengeToken: string) => {
    const response = await userApi.post('/user/resend-otp', {
      challenge_token: challengeToken,
    });
    return response.data;
  },

  logout: async () => {
    const response = await userApi.post('/user/logout');
    return response.data;
  },

  /** Global sign-out — revoke tokens on ALL devices */
  logoutAll: async () => {
    const response = await userApi.post('/user/logout-all');
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

  // ── Security Center ──
  /** MFA status + recent login activity (audit log) */
  securityOverview: async () => {
    const response = await userApi.get('/user/security');
    return response.data;
  },

  /** Toggle Email OTP 2FA */
  toggleMfa: async (enabled: boolean) => {
    const response = await userApi.post('/user/security/mfa', { enabled });
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await userApi.put('/user/profile', data);
    return response.data;
  },

  // ── Password Reset (Forgot Password) ──
  /** Request password reset OTP */
  forgotPassword: async (email: string) => {
    const response = await userApi.post('/user/forgot-password', { email });
    return response.data;
  },

  /** Verify password reset OTP */
  verifyResetOtp: async (challengeToken: string, code: string) => {
    const response = await userApi.post('/user/verify-reset-otp', {
      challenge_token: challengeToken,
      code,
    });
    return response.data;
  },

  /** Reset password with verified OTP */
  resetPassword: async (challengeToken: string, code: string, password: string, password_confirmation: string) => {
    const response = await userApi.post('/user/reset-password', {
      challenge_token: challengeToken,
      code,
      password,
      password_confirmation,
    });
    return response.data;
  },

  /** Resend password reset OTP */
  resendResetOtp: async (challengeToken: string) => {
    const response = await userApi.post('/user/resend-reset-otp', {
      challenge_token: challengeToken,
    });
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

  // GMB-style performance analytics
  getAnalytics: async (params?: { business_id?: number | string; range?: number }) => {
    const response = await userApi.get('/user/analytics', { params });
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

// Event API
export const userEventApi = {
  getAll: async (params?: any) => {
    const queryParams = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await userApi.get(`/user/events${queryParams}`);
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await userApi.get(`/user/events/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await userApi.get('/user/events/stats');
    return response.data;
  },

  create: async (data: any) => {
    const response = await userApi.post('/user/events', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await userApi.put(`/user/events/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await userApi.delete(`/user/events/${id}`);
    return response.data;
  },

  uploadImage: async (imageData: string, type: 'featured' | 'banner' | 'gallery') => {
    const response = await userApi.post('/user/events/upload-image', {
      image: imageData,
      type: type
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

// Updates API (GMB-style posts)
export const userUpdateApi = {
  getAll: async () => {
    const response = await userApi.get('/user/updates');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await userApi.get(`/user/updates/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await userApi.post('/user/updates', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await userApi.put(`/user/updates/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await userApi.delete(`/user/updates/${id}`);
    return response.data;
  },

  toggleActive: async (id: number) => {
    const response = await userApi.post(`/user/updates/${id}/toggle-active`);
    return response.data;
  },

  uploadImage: async (imageData: string) => {
    const response = await userApi.post('/user/upload-image-base64', {
      image: imageData,
      type: 'update'
    });
    return response.data;
  },
};

// Verification API (owner self-service — Get Verified)
export const userVerificationApi = {
  getStatus: async (businessId: number) => {
    const response = await userApi.get(`/user/businesses/${businessId}/verification`);
    return response.data;
  },

  uploadDocument: async (businessId: number, formData: FormData) => {
    const response = await userApi.post(`/user/businesses/${businessId}/verification/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteDocument: async (businessId: number, docId: number) => {
    const response = await userApi.delete(`/user/businesses/${businessId}/verification/documents/${docId}`);
    return response.data;
  },

  requestVerification: async (businessId: number) => {
    const response = await userApi.post(`/user/businesses/${businessId}/verification/request`);
    return response.data;
  },

  cancelRequest: async (businessId: number) => {
    const response = await userApi.post(`/user/businesses/${businessId}/verification/cancel-request`);
    return response.data;
  },
};

export default userApi;
