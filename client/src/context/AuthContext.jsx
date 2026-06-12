import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider – wraps the app and supplies authentication state & helpers.
 *
 * Persisted state:
 *   • token  → localStorage  "token"
 *   • user   → fetched from /api/auth/profile on mount when token exists
 *
 * Exposed via context:
 *   user, token, loading, isAuthenticated, login, signup, logout
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // ── Hydrate user from saved token on mount ──────────────────────────
  useEffect(() => {
    const hydrate = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/api/auth/profile');
        setUser(data);
        setToken(savedToken);
      } catch {
        // Token expired / invalid – clean up
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    const newToken = data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Fetch user profile after login
    const profileRes = await api.get('/api/auth/profile');
    setUser(profileRes.data);
    return data;
  }, []);

  // ── Signup ──────────────────────────────────────────────────────────
  const signup = useCallback(async (name, email, password) => {
    const { data } = await api.post('/api/auth/signup', { name, email, password });
    const newToken = data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Fetch user profile after signup
    const profileRes = await api.get('/api/auth/profile');
    setUser(profileRes.data);
    return data;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume auth context.
 * Must be used inside an <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
