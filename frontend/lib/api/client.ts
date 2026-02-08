import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 seconds (increased for AI quest generation which takes ~40s)
  maxRedirects: 0, // Prevent following redirects (which cause CORS issues)
});

// Request interceptor - add JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle session expiration (401 or 302 redirect to OAuth)
    if (error.response?.status === 401 || error.response?.status === 302) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    // Handle network errors that might be caused by redirects
    if (error.message === 'Network Error' && error.config?.url) {
      // Check if the error is likely due to OAuth redirect
      const token = localStorage.getItem('auth_token');
      if (!token || token === 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
