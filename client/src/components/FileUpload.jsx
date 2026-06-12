import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  X,
} from 'lucide-react';
import api from '../services/api';

/**
 * FileUpload – drag-and-drop (or click) PDF upload component.
 *
 * Props:
 *   onUploadComplete(data)  – called with the server response after a successful upload
 *   onUploadError(err)      – called when the upload fails
 */
export default function FileUpload({ onUploadComplete, onUploadError }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  // ── Validate & accept a file ────────────────────────────────────────
  const acceptFile = useCallback((f) => {
    setError('');
    setSuccess(false);
    setPasswordRequired(false);
    setPdfPassword('');
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File size must be under 50 MB.');
      return;
    }
    setFile(f);
  }, []);

  // ── Drag handlers ──────────────────────────────────────────────────
  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    acceptFile(dropped);
  };

  // ── Upload ─────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    if (passwordRequired && !pdfPassword) {
      setError('Enter the PDF password to continue.');
      return;
    }
    setUploading(true);
    setProgress(0);
    setError('');
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    if (pdfPassword) formData.append('password', pdfPassword);

    try {
      const { data } = await api.post('/api/upload', formData, {
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / (e.total || 1));
          setProgress(pct);
        },
      });
      setSuccess(true);
      setPdfPassword('');
      onUploadComplete?.(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const passwordError =
        detail?.code === 'PDF_PASSWORD_REQUIRED' ||
        detail?.code === 'PDF_INVALID_PASSWORD';

      if (passwordError) {
        setPasswordRequired(true);
        setPdfPassword('');
      }

      const msg =
        detail?.message ||
        (typeof detail === 'string' ? detail : null) ||
        err.response?.data?.message ||
        'Upload failed. Please try again.';
      setError(msg);
      onUploadError?.(err);
    } finally {
      setUploading(false);
    }
  };

  // ── Clear selection ────────────────────────────────────────────────
  const clearFile = () => {
    setFile(null);
    setError('');
    setSuccess(false);
    setProgress(0);
    setPasswordRequired(false);
    setPdfPassword('');
    setShowPassword(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* ── Drop zone ───────────────────────────────────────────────── */}
      {!file && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
            dragOver
              ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/10'
              : 'border-navy-200 bg-navy-50/50 hover:border-gold-400 hover:bg-navy-50 dark:border-navy-700 dark:bg-navy-900/30 dark:hover:border-gold-500/50 dark:hover:bg-navy-900/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => acceptFile(e.target.files?.[0])}
          />

          <motion.div
            animate={dragOver ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="rounded-2xl bg-navy-100 p-4 dark:bg-navy-800">
              <Upload className="h-8 w-8 text-navy-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-navy-800 dark:text-gray-200">
                {dragOver ? 'Drop your PDF here' : 'Drag & drop your bank statement'}
              </p>
              <p className="mt-1 text-sm text-navy-500 dark:text-gray-500">
                or{' '}
                <span className="font-medium text-gold-600 dark:text-gold-400">
                  click to browse
                </span>{' '}
                · HDFC statement PDF only · Max 50 MB
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Selected file ───────────────────────────────────────────── */}
      <AnimatePresence>
        {file && !success && (
          <motion.div
            key="file-info"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-navy-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
                  <FileText className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-sm text-navy-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={clearFile}
                  className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 hover:text-navy-600 dark:hover:bg-navy-800 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {passwordRequired && !uploading && (
              <div className="mt-4">
                <label
                  htmlFor="pdf-password"
                  className="mb-1.5 block text-sm font-medium text-navy-700 dark:text-gray-300"
                >
                  PDF password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400 dark:text-gray-500" />
                  <input
                    id="pdf-password"
                    type={showPassword ? 'text' : 'password'}
                    value={pdfPassword}
                    onChange={(e) => {
                      setPdfPassword(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpload();
                    }}
                    autoComplete="off"
                    autoFocus
                    placeholder="Enter password to unlock this PDF"
                    className="w-full rounded-xl border border-navy-200 bg-navy-50/50 py-2.5 pl-10 pr-11 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 dark:border-navy-700 dark:bg-navy-800 dark:text-white dark:placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 dark:text-gray-500 dark:hover:text-gray-300"
                    aria-label={showPassword ? 'Hide PDF password' : 'Show PDF password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-navy-500 dark:text-gray-400">
                  The password is used only to process this upload and is not saved.
                </p>
              </div>
            )}

            {/* Progress bar */}
            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy-600 dark:text-gray-400">
                    {progress < 100 ? 'Uploading…' : 'Analyzing…'}
                  </span>
                  <span className="font-medium text-navy-900 dark:text-white">
                    {progress}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Upload button */}
            {!uploading && (
              <button
                onClick={handleUpload}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <Upload className="h-4 w-4" />
                {passwordRequired ? 'Unlock and Analyze' : 'Analyze Statement'}
              </button>
            )}

            {/* Uploading spinner */}
            {uploading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-navy-600 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin text-gold-500" />
                Processing your statement…
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success state ───────────────────────────────────────────── */}
      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20"
          >
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Analysis complete! Scroll down to view results.
            </p>
            <button
              onClick={clearFile}
              className="ml-auto text-sm font-medium text-green-700 underline hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
            >
              Upload another
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error state ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {error}
            </p>
            <button
              onClick={() => setError('')}
              className="ml-auto"
            >
              <X className="h-4 w-4 text-red-400 hover:text-red-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
