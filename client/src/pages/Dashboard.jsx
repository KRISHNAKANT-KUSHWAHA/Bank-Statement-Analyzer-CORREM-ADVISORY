import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Clock,
  FileText,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import FileUpload from '../components/FileUpload';
import AnalysisResult from '../components/AnalysisResult';
import StatsCard from '../components/StatsCard';

/**
 * Dashboard – main authenticated view.
 * Shows welcome message, quick stats, file upload, analysis results,
 * and recent analyses preview.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [lastUpload, setLastUpload] = useState(null);

  // ── Load recent analyses on mount ──────────────────────────────────
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await api.get('/api/history');
        const list = Array.isArray(data) ? data : data.analyses || [];
        setRecentAnalyses(list.slice(0, 3));
        setTotalAnalyses(list.length);
        if (list.length > 0) {
          setLastUpload(list[0].created_at || list[0].upload_date || null);
        }
      } catch {
        // History endpoint might not exist yet
      } finally {
        setStatsLoading(false);
      }
    };
    fetchRecent();
  }, [analysisData]); // re-fetch after new analysis

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Welcome ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
            Welcome back,{' '}
            <span className="text-gold-500">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </h1>
          <p className="mt-1 text-navy-500 dark:text-gray-400">
            Upload a bank statement to get started, or view your past analyses.
          </p>
        </motion.div>

        {/* ── Quick Stats ──────────────────────────────────────────── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statsLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl bg-navy-100 dark:bg-navy-800"
                />
              ))}
            </>
          ) : (
            <>
              <StatsCard
                icon={BarChart3}
                title="Total Analyses"
                value={totalAnalyses}
                subtitle="Statements processed"
                gradient="from-navy-800 to-navy-700"
              />
              <StatsCard
                icon={CalendarDays}
                title="Last Upload"
                value={formatDate(lastUpload)}
                subtitle="Most recent analysis"
                gradient="from-navy-700 to-navy-600"
              />
              <StatsCard
                icon={FileText}
                title="Recent"
                value={recentAnalyses.length}
                subtitle="Analyses this session"
                gradient="from-gold-600 to-gold-700"
              />
            </>
          )}
        </div>

        {/* ── Upload Section ───────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-xl font-bold text-navy-900 dark:text-white">
            Analyze a Statement
          </h2>
          <FileUpload
            onUploadComplete={(data) => setAnalysisData(data)}
            onUploadError={() => {}}
          />
        </motion.section>

        {/* ── Analysis Results ─────────────────────────────────────── */}
        {analysisData && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <AnalysisResult data={analysisData} />
          </motion.section>
        )}

        {/* ── Recent Analyses ─────────────────────────────────────── */}
        {recentAnalyses.length > 0 && !analysisData && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="mb-4 text-xl font-bold text-navy-900 dark:text-white">
              Recent Analyses
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentAnalyses.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-navy-800 dark:bg-navy-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-red-50 p-2.5 dark:bg-red-900/20">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-navy-900 dark:text-white">
                        {item.original_pdf_name || 'Statement'}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-navy-400 dark:text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.upload_date)}
                      </p>
                      {(item.total_transactions != null) && (
                        <p className="mt-1 text-xs text-navy-500 dark:text-gray-400">
                          {item.total_transactions} transactions
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
