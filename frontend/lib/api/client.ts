import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Hardcoded for production deployment - same fix as auth callback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://questlearn-production.up.railway.app';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 seconds (increased for AI quest generation which takes ~40s)
});

// Whitelist of endpoints that don't require authentication
// IMPORTANT: Keep this in sync with backend SecurityConfig.kt
const PUBLIC_ENDPOINTS = [
  '/api/v1/auth/login/student',           // Student class code login
  '/api/v1/quests/generate',              // Quest generation (for demo/testing)
  '/oauth2/authorization/google',          // Google OAuth redirect
  '/login/oauth2/code/google',            // Google OAuth callback
] as const;

/**
 * Check if a URL is a public endpoint that doesn't require authentication
 * Uses exact path matching to prevent URL injection attacks
 */
function isPublicEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  
  return PUBLIC_ENDPOINTS.some(endpoint => {
    // Exact match
    if (url === endpoint) return true;
    
    // Match with query params or hash
    if (url.startsWith(endpoint + '?') || url.startsWith(endpoint + '#')) {
      return true;
    }
    
    return false;
  });
}

// Request interceptor - add JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip token check for public endpoints
    if (isPublicEndpoint(config.url)) {
      return config;
    }
    
    // For protected endpoints, require token
    const token = localStorage.getItem('auth_token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // No valid token - redirect to login immediately
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('No authentication token'));
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
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    // Handle network errors that might indicate session issues
    if (error.message === 'Network Error' || !error.response) {
      const token = localStorage.getItem('auth_token');
      if (!token || token === 'undefined' || token === 'null') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
