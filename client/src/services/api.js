import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Pre-configured Axios instance for all API calls.
 * - Base URL is empty (uses Vite proxy in dev, relative paths in prod).
 * - Automatically attaches the JWT bearer token from localStorage.
 * - On 401 responses, clears auth state and redirects to /login.
 */
const api = axios.create({
  baseURL: apiBaseUrl,
});

// ── Request interceptor ─────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we're not already on login/signup
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
