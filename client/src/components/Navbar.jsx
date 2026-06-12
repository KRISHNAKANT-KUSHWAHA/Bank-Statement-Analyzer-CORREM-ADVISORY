import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Landmark,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  History,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Navbar – top navigation bar with glassmorphism, dark mode toggle,
 * responsive hamburger menu, and user dropdown.
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── Dark mode side-effect ───────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // ── Close dropdown on outside click ─────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/history', label: 'History', icon: History },
      ]
    : [];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl dark:bg-navy-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-navy-800 to-navy-600 shadow-md group-hover:shadow-lg transition-shadow">
            <Landmark className="h-5 w-5 text-gold-400" />
          </div>
          <span className="text-lg font-bold tracking-tight text-navy-900 dark:text-white">
            HDFC <span className="text-gold-500">Analyzer</span>
          </span>
        </Link>

        {/* ── Desktop nav ──────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-navy-100 text-navy-900 dark:bg-navy-800 dark:text-white'
                  : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900 dark:text-gray-400 dark:hover:bg-navy-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right side controls ──────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark((d) => !d)}
            className="rounded-lg p-2 text-navy-600 hover:bg-navy-100 dark:text-gray-400 dark:hover:bg-navy-800 transition-colors"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={dark}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User dropdown (desktop) */}
          {isAuthenticated && (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-100 dark:text-gray-300 dark:hover:bg-navy-800 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-xs font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user?.name || 'User'}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-navy-700 dark:bg-navy-900"
                  >
                    <div className="border-b border-gray-100 px-3 py-2 dark:border-navy-700">
                      <p className="text-sm font-semibold text-navy-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-navy-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Auth buttons (desktop, unauthenticated) */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-100 dark:text-gray-300 dark:hover:bg-navy-800 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-navy-600 hover:bg-navy-100 dark:text-gray-400 dark:hover:bg-navy-800 md:hidden transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-200 bg-white dark:border-navy-800 dark:bg-navy-950 md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'bg-navy-100 text-navy-900 dark:bg-navy-800 dark:text-white'
                      : 'text-navy-600 hover:bg-navy-50 dark:text-gray-400 dark:hover:bg-navy-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="my-2 border-t border-gray-200 dark:border-navy-800" />
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-navy-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <div className="my-2 border-t border-gray-200 dark:border-navy-800" />
                  <Link
                    to="/login"
                    className="block rounded-lg px-3 py-2.5 text-center text-sm font-medium text-navy-700 hover:bg-navy-100 dark:text-gray-300 dark:hover:bg-navy-800 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="block rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-md transition-shadow"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
