import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add token
adminApi.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const adminAuth = localStorage.getItem('admin-auth-storage');
    if (adminAuth) {
      const { state } = JSON.parse(adminAuth);
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
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('admin-auth-storage');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const adminAuthApi = {
  login: async (email: string, password: string) => {
    const response = await adminApi.post('/admin/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await adminApi.post('/admin/logout');
    return response.data;
  },

  me: async () => {
    const response = await adminApi.get('/admin/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => {
    const response = await adminApi.post('/admin/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
    return response.data;
  },
};

// Dashboard API
export const adminDashboardApi = {
  getStats: async () => {
    const response = await adminApi.get('/admin/dashboard');
    return response.data;
  },

  getQuickStats: async () => {
    const response = await adminApi.get('/admin/dashboard/quick-stats');
    return response.data;
  },
};

// Businesses API
export const adminBusinessesApi = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/businesses', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await adminApi.get(`/admin/businesses/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/businesses', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await adminApi.put(`/admin/businesses/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/businesses/${id}`);
    return response.data;
  },

  approve: async (id: number) => {
    const response = await adminApi.post(`/admin/businesses/${id}/approve`);
    return response.data;
  },

  reject: async (id: number) => {
    const response = await adminApi.post(`/admin/businesses/${id}/reject`);
    return response.data;
  },

  feature: async (id: number) => {
    const response = await adminApi.post(`/admin/businesses/${id}/feature`);
    return response.data;
  },

  verify: async (id: number) => {
    const response = await adminApi.post(`/admin/businesses/${id}/verify`);
    return response.data;
  },

  toggleTrending: async (id: number) => {
    const response = await adminApi.post(`/admin/businesses/${id}/toggle-trending`);
    return response.data;
  },

  toggleSponsored: async (id: number) => {
    const response = await adminApi.post(`/admin/businesses/${id}/toggle-sponsored`);
    return response.data;
  },

  bulkAction: async (ids: number[], action: string) => {
    const response = await adminApi.post('/admin/businesses/bulk-action', { ids, action });
    return response.data;
  },

  uploadImageBase64: async (base64: string, type: string = 'logo') => {
    const response = await adminApi.post('/admin/businesses', { image_base64: base64, image_type: type });
    return response.data;
  },
};

// Hidden Gems API
export const adminHiddenGemsApi = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/hidden-gems', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await adminApi.get(`/admin/hidden-gems/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/hidden-gems', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await adminApi.put(`/admin/hidden-gems/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/hidden-gems/${id}`);
    return response.data;
  },

  feature: async (id: number) => {
    const response = await adminApi.post(`/admin/hidden-gems/${id}/feature`);
    return response.data;
  },

  toggleActive: async (id: number) => {
    const response = await adminApi.post(`/admin/hidden-gems/${id}/toggle-active`);
    return response.data;
  },

  syncGmb: async (id: number) => {
    const response = await adminApi.post(`/admin/hidden-gems/${id}/sync-gmb`);
    return response.data;
  },

  bulkAction: async (ids: number[], action: string) => {
    const response = await adminApi.post('/admin/hidden-gems/bulk-action', { ids, action });
    return response.data;
  },
};

// Reviews API
export const adminReviewsApi = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/reviews', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await adminApi.get(`/admin/reviews/${id}`);
    return response.data;
  },

  approve: async (id: number) => {
    const response = await adminApi.post(`/admin/reviews/${id}/approve`);
    return response.data;
  },

  reject: async (id: number) => {
    const response = await adminApi.post(`/admin/reviews/${id}/reject`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  bulkAction: async (ids: number[], action: string) => {
    const response = await adminApi.post('/admin/reviews/bulk-action', { ids, action });
    return response.data;
  },
};

// Blog API
export const adminBlogApi = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/blog', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await adminApi.get(`/admin/blog/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/blog', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await adminApi.put(`/admin/blog/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/blog/${id}`);
    return response.data;
  },

  togglePublish: async (id: number) => {
    const response = await adminApi.post(`/admin/blog/${id}/toggle-publish`);
    return response.data;
  },
};

// Events API
export const adminEventsApi = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/events', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await adminApi.get(`/admin/events/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/events', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await adminApi.put(`/admin/events/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/events/${id}`);
    return response.data;
  },

  toggleActive: async (id: number) => {
    const response = await adminApi.post(`/admin/events/${id}/toggle-active`);
    return response.data;
  },

  toggleFeature: async (id: number) => {
    const response = await adminApi.post(`/admin/events/${id}/toggle-feature`);
    return response.data;
  },
};

// Categories API
export const adminCategoriesApi = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/categories', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await adminApi.get(`/admin/categories/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/categories', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await adminApi.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/categories/${id}`);
    return response.data;
  },

  toggleActive: async (id: number) => {
    const response = await adminApi.post(`/admin/categories/${id}/toggle-active`);
    return response.data;
  },
};

// Areas API
export const adminAreasApi = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/areas', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await adminApi.get(`/admin/areas/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/areas', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await adminApi.put(`/admin/areas/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/areas/${id}`);
    return response.data;
  },

  toggleActive: async (id: number) => {
    const response = await adminApi.post(`/admin/areas/${id}/toggle-active`);
    return response.data;
  },
};

// Users API
export const adminUsersApi = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/users', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await adminApi.get(`/admin/users/${id}`);
    return response.data;
  },

  updateRole: async (id: number, role: string) => {
    const response = await adminApi.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  toggleActive: async (id: number) => {
    const response = await adminApi.post(`/admin/users/${id}/toggle-active`);
    return response.data;
  },

  updatePermissions: async (id: number, permissions: string[]) => {
    const response = await adminApi.put(`/admin/users/${id}/permissions`, { permissions });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/users/${id}`);
    return response.data;
  },
};

// Subscriptions API
export const adminSubscriptionsApi = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/subscriptions', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await adminApi.get(`/admin/subscriptions/${id}`);
    return response.data;
  },

  cancel: async (id: number) => {
    const response = await adminApi.post(`/admin/subscriptions/${id}/cancel`);
    return response.data;
  },
};

// Blog Categories API (admin managed)
export const adminBlogCategoriesApi = {
  getAll: async () => {
    const response = await adminApi.get('/admin/blog-categories');
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/blog-categories', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await adminApi.put(`/admin/blog-categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/blog-categories/${id}`);
    return response.data;
  },
};

// Media Upload API (images for blog editor / featured images)
export const adminMediaApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await adminApi.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (path: string) => {
    const response = await adminApi.delete('/admin/upload', { params: { path } });
    return response.data;
  },
};

export default adminApi;
