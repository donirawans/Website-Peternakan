import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // NEVER redirect for public endpoints regardless of page
    if (error.config?.url?.includes('/public/')) {
      return Promise.reject(error);
    }
    // HANYA redirect jika sedang mengakses rute admin (BUKAN landing publik)
    if (
      error.response?.status === 401 &&
      window.location.pathname.startsWith('/admin') &&
      window.location.pathname !== '/admin/login'
    ) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/public/login', { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await api.post('/public/register', { name, email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/admin/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/admin/profile', profileData);
    return response.data;
  },
  updatePassword: async (passwordData) => {
    const response = await api.put('/admin/profile/password', passwordData);
    return response.data;
  },
};

export const cattleAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.breed) params.append('breed', filters.breed);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.status) params.append('status', filters.status);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/public/cattles?${params.toString()}`);
    return response.data;
  },

  getAllAdmin: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    const response = await api.get(`/admin/cattles?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/public/cattles/${id}`);
    return response.data;
  },

  create: async (cattleData) => {
    const response = await api.post('/admin/cattles', cattleData);
    return response.data;
  },

  update: async (id, cattleData) => {
    const response = await api.put(`/admin/cattles/${id}`, cattleData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/cattles/${id}`);
    return response.data;
  },
};

export const transactionAPI = {
  getAll: async () => {
    const response = await api.get('/admin/transactions');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/transactions/${id}`);
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/admin/transactions/summary');
    return response.data;
  },

  create: async (transactionData) => {
    const response = await api.post('/admin/transactions', transactionData);
    return response.data;
  },

  update: async (id, transactionData) => {
    const response = await api.put(`/admin/transactions/${id}`, transactionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/transactions/${id}`);
    return response.data;
  },
};

export const bankAccountAPI = {
  getActive: async () => {
    const response = await api.get('/public/bank-accounts');
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/admin/bank-accounts');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/bank-accounts/${id}`);
    return response.data;
  },

  create: async (bankAccountData) => {
    const response = await api.post('/admin/bank-accounts', bankAccountData);
    return response.data;
  },

  update: async (id, bankAccountData) => {
    const response = await api.put(`/admin/bank-accounts/${id}`, bankAccountData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/bank-accounts/${id}`);
    return response.data;
  },
};

export const farmSettingAPI = {
  getAll: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  getPublic: async () => {
    const response = await api.get('/public/settings');
    return response.data;
  },

  update: async (settingData) => {
    const response = await api.put('/admin/settings', settingData);
    return response.data;
  },
};

export const uploadAPI = {
  uploadFiles: async (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files[]', file);
    }
    const response = await api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const visitRequestAPI = {
  create: async (data) => {
    const response = await api.post('/public/visit-requests', data);
    return response.data;
  },
};

export const notificationAPI = {
  getAll: async () => {
    const response = await api.get('/admin/notifications');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/admin/notifications/${id}/read`);
    return response.data;
  },
};

export default api;
