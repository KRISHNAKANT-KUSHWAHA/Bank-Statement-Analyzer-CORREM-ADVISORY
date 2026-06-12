import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute – guards routes that require authentication.
 * Shows a spinner while loading, redirects to /login when unauthenticated.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-navy-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
          <p className="text-navy-600 dark:text-gray-400 font-medium">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
