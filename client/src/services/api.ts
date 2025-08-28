import axios from 'axios';

// API Base URL - Update this for production deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  verifyOTP: (username: string, code: string) =>
    api.post('/auth/verify-otp', { username, code }),
  getProfile: () =>
    api.get('/auth/profile'),
  logout: () =>
    api.post('/auth/logout'),
};

// Accounts API
export const accountsAPI = {
  getAll: () =>
    api.get('/accounts'),
  getById: (id: string) =>
    api.get(`/accounts/${id}`),
  getBalance: (id: string) =>
    api.get(`/accounts/${id}/balance`),
  getStatements: (id: string) =>
    api.get(`/accounts/${id}/statements`),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params?: any) =>
    api.get('/transactions', { params }),
  getTransactions: (page: number = 1, limit: number = 10) =>
    api.get('/transactions', { params: { page, limit } }),
  getById: (id: string) =>
    api.get(`/transactions/${id}`),
  getCategories: () =>
    api.get('/transactions/categories/list'),
  getSpendingAnalysis: (params?: any) =>
    api.get('/transactions/analysis/spending', { params }),
  getAnalytics: () =>
    api.get('/transactions/analytics'),
  // Transfer functions
  internalTransfer: (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
  }) =>
    api.post('/transactions/transfer/internal', data),
  externalTransfer: (data: {
    fromAccountId: string;
    recipientName: string;
    recipientEmail?: string;
    recipientAccount?: string;
    amount: number;
    description?: string;
    transferType: 'zelle' | 'ach' | 'wire';
  }) =>
    api.post('/transactions/transfer/external', data),
  wireTransfer: (data: {
    fromAccountType: 'checking' | 'savings';
    recipientName: string;
    recipientBankName: string;
    recipientBankAddress: string;
    recipientAccountNumber: string;
    recipientRoutingNumber: string;
    amount: number;
    description?: string;
    swiftCode?: string;
    priority?: 'standard' | 'priority';
    fromAccountId?: string;
  }) =>
    api.post('/transactions/wire-transfer', data),
  getTransferHistory: (params?: any) =>
    api.get('/transactions/transfers/history', { params }),
};

export default api;