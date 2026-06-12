import React, { useState, useMemo } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Landmark,
  AlertCircle,
} from 'lucide-react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InputField({
  id,
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  toggle,
  onToggle,
  showToggle,
  error,
  maxLength,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-navy-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400 dark:text-gray-500" />
        <input
          id={id}
          type={toggle ? (showToggle ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-navy-50/50 py-2.5 pl-10 pr-11 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 dark:bg-navy-800 dark:text-white dark:placeholder:text-gray-500 transition-colors ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-navy-200 focus:border-gold-500 focus:ring-gold-500/20 dark:border-navy-700 dark:focus:border-gold-500'
          }`}
        />
        {toggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 dark:text-gray-500 dark:hover:text-gray-300"
            tabIndex={-1}
            aria-label={showToggle ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          >
            {showToggle ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Signup page – centered card with gradient background, password strength
 * indicator, validation, and smooth animations.
 */
export default function Signup() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  // ── Password strength ──────────────────────────────────────────────
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0–5
  }, [password]);

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][
    strength
  ];
  const strengthColor = [
    'bg-gray-200 dark:bg-navy-700',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-emerald-500',
  ][strength];

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const nextErrors = {};
    if (!name.trim()) {
      nextErrors.name = 'Full name is required.';
    }
    if (!email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    if (!confirmPwd) {
      nextErrors.confirmPwd = 'Please confirm your password.';
    } else if (password !== confirmPwd) {
      nextErrors.confirmPwd = 'Passwords do not match.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-navy-50 via-white to-gold-50 px-4 py-10 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-xl dark:border-navy-800 dark:bg-navy-900">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-600 shadow-lg">
              <Landmark className="h-7 w-7 text-gold-400" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-navy-500 dark:text-gray-400">
              Start analyzing your bank statements today
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <InputField
              id="signup-name"
              label="Full name"
              icon={User}
              value={name}
              onChange={(value) => {
                setName(value);
                setFieldErrors((current) => ({ ...current, name: '' }));
              }}
              placeholder="John Doe"
              autoComplete="name"
              error={fieldErrors.name}
              maxLength={100}
            />
            <InputField
              id="signup-email"
              label="Email address"
              icon={Mail}
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setFieldErrors((current) => ({ ...current, email: '' }));
              }}
              placeholder="you@example.com"
              autoComplete="email"
              error={fieldErrors.email}
            />
            <div>
              <InputField
                id="signup-password"
                label="Password"
                icon={Lock}
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setFieldErrors((current) => ({
                    ...current,
                    password: '',
                    confirmPwd: '',
                  }));
                }}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                toggle
                showToggle={showPwd}
                onToggle={() => setShowPwd((s) => !s)}
                error={fieldErrors.password}
                maxLength={128}
              />
              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((seg) => (
                      <div
                        key={seg}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          seg <= strength
                            ? strengthColor
                            : 'bg-gray-200 dark:bg-navy-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-navy-500 dark:text-gray-400">
                    Strength:{' '}
                    <span className="font-medium">{strengthLabel}</span>
                  </p>
                </div>
              )}
            </div>
            <InputField
              id="signup-confirm-password"
              label="Confirm password"
              icon={Lock}
              value={confirmPwd}
              onChange={(value) => {
                setConfirmPwd(value);
                setFieldErrors((current) => ({ ...current, confirmPwd: '' }));
              }}
              placeholder="Re-enter password"
              autoComplete="new-password"
              toggle
              showToggle={showConfirm}
              onToggle={() => setShowConfirm((s) => !s)}
              error={fieldErrors.confirmPwd}
              maxLength={128}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 py-3 text-sm font-bold text-white shadow-lg shadow-gold-500/20 hover:shadow-xl disabled:opacity-70 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-navy-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
