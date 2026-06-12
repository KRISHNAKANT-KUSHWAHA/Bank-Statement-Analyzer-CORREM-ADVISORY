import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Clock,
  Hash,
  Loader2,
  Inbox,
  Search,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

/**
 * History – view all past analyses with download capability.
 * Responsive: table on desktop, cards on mobile.
 */
export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(null); // analysis_id being downloaded

  // ── Fetch history ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/api/history');
        setAnalyses(Array.isArray(data) ? data : data.analyses || []);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            'Failed to load history.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // ── Download handler ───────────────────────────────────────────────
  const handleDownload = async (id, filename) => {
    setDownloading(id);
    try {
      const response = await api.get(`/api/download/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename || 'analysis'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filtered = analyses.filter((a) => {
    const name = (a.original_pdf_name || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  // ── Loading skeleton ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-navy-100 dark:bg-navy-800" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-navy-100 dark:bg-navy-800" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-navy-100 dark:bg-navy-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
              Analysis History
            </h1>
            <p className="mt-1 text-navy-500 dark:text-gray-400">
              {analyses.length} statement{analyses.length !== 1 ? 's' : ''} analyzed
            </p>
          </div>

          {analyses.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400 dark:text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by filename…"
                className="w-full rounded-xl border border-navy-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-white dark:placeholder:text-gray-500 transition-colors"
              />
            </div>
          )}
        </motion.div>

        {/* ── Error ─────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────── */}
        {analyses.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-navy-100 bg-white py-20 dark:border-navy-800 dark:bg-navy-900"
          >
            <div className="rounded-2xl bg-navy-50 p-5 dark:bg-navy-800">
              <Inbox className="h-12 w-12 text-navy-300 dark:text-gray-600" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-navy-900 dark:text-white">
              No analyses yet
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-navy-500 dark:text-gray-400">
              Upload your first HDFC bank statement from the dashboard to see
              your analysis history here.
            </p>
            <a
              href="/dashboard"
              className="mt-6 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-shadow hover:shadow-xl"
            >
              Go to Dashboard
            </a>
          </motion.div>
        )}

        {/* ── Desktop Table ────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <>
            <div className="hidden md:block">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm dark:border-navy-800 dark:bg-navy-900"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-100 bg-navy-50/50 dark:border-navy-800 dark:bg-navy-800/50">
                      <th className="px-6 py-4 text-left font-semibold text-navy-500 dark:text-gray-400">
                        PDF Name
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-navy-500 dark:text-gray-400">
                        Upload Date
                      </th>
                      <th className="px-6 py-4 text-center font-semibold text-navy-500 dark:text-gray-400">
                        Transactions
                      </th>
                      <th className="px-6 py-4 text-right font-semibold text-navy-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filtered.map((item, i) => {
                        const id = item.id;
                        return (
                          <motion.tr
                            key={id || i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-navy-50 last:border-0 hover:bg-navy-50/50 dark:border-navy-800 dark:hover:bg-navy-800/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                                  <FileText className="h-4 w-4 text-red-500" />
                                </div>
                                <span className="max-w-[260px] truncate font-medium text-navy-900 dark:text-white">
                                  {item.original_pdf_name || 'Statement'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-navy-600 dark:text-gray-400">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDate(item.upload_date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700 dark:bg-navy-800 dark:text-gray-300">
                                <Hash className="h-3 w-3" />
                                {item.total_transactions ?? '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() =>
                                  handleDownload(
                                    id,
                                    item.original_pdf_name
                                  )
                                }
                                disabled={downloading === id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-60 transition-all"
                              >
                                {downloading === id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                                Download
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            </div>

            {/* ── Mobile Cards ───────────────────────────────────────── */}
            <div className="space-y-3 md:hidden">
              {filtered.map((item, i) => {
                const id = item.id;
                return (
                  <motion.div
                    key={id || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                          <FileText className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-navy-900 dark:text-white">
                            {item.original_pdf_name || 'Statement'}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-navy-400 dark:text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatDate(item.upload_date)}
                          </p>
                        </div>
                      </div>
                      {item.total_transactions != null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2 py-0.5 text-xs font-medium text-navy-600 dark:bg-navy-800 dark:text-gray-400">
                          <Hash className="h-3 w-3" />
                          {item.total_transactions}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handleDownload(id, item.original_pdf_name)
                      }
                      disabled={downloading === id}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-60 transition-all"
                    >
                      {downloading === id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download Excel
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* No results from search */}
        {analyses.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Search className="h-10 w-10 text-navy-300 dark:text-gray-600" />
            <p className="mt-4 text-navy-500 dark:text-gray-400">
              No analyses match "<span className="font-medium">{search}</span>"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
