import React from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  CreditCard,
  CalendarDays,
  Banknote,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Building2,
  PieChart,
} from 'lucide-react';
import api from '../services/api';

/* ═══════════════════════════════════════════════════════════════════════
   COLOUR MAP for category badges
   ═══════════════════════════════════════════════════════════════════════ */
const CATEGORY_COLORS = {
  'Salary': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Food & Dining': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Shopping': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  'UPI/Transfer': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'EMI/Loan': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Investments': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Utilities': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Rent': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Insurance': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  'Entertainment': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  'Travel': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Education': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  'Healthcare': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Cash Withdrawal': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Telecom': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const badgeColor = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: format ₹ amount
   ═══════════════════════════════════════════════════════════════════════ */
const fmt = (n) => {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n);
};

/* ═══════════════════════════════════════════════════════════════════════
   SECTION WRAPPER with entrance animation
   ═══════════════════════════════════════════════════════════════════════ */
const Section = ({ title, icon: Icon, children, delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm dark:border-navy-800 dark:bg-navy-900"
  >
    {title && (
      <div className="mb-5 flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-gold-500" />}
        <h3 className="text-lg font-bold text-navy-900 dark:text-white">{title}</h3>
      </div>
    )}
    {children}
  </motion.section>
);

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * AnalysisResult – renders a complete analysis report.
 *
 * Props:
 *   data – the JSON response from POST /api/upload
 *          Expected shape (matches backend UploadResponse):
 *          {
 *            analysis_id, total_transactions, account_details,
 *            category_summary, monthly_analysis, top_transactions,
 *            salary_detection, emi_detection, categorization_stats
 *          }
 */
export default function AnalysisResult({ data }) {
  if (!data) return null;

  const {
    analysis_id,
    total_transactions = 0,
    account_details = {},
    category_summary = [],
    monthly_analysis = [],
    top_transactions = [],
    salary_detection = [],
    emi_detection = [],
    categorization_stats = {},
  } = data;

  // Compute total credit/debit from account_details or category_summary
  const totalCredit = account_details.total_credits
    ?? category_summary.reduce((s, c) => s + (c.total_credit || 0), 0);
  const totalDebit = account_details.total_debits
    ?? category_summary.reduce((s, c) => s + (c.total_debit || 0), 0);

  // Max debit across categories for bar width calculation
  const maxDebit = Math.max(...category_summary.map(c => c.total_debit || 0), 1);

  // ── Download handler ───────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      const response = await api.get(`/api/download/${analysis_id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis_${analysis_id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header + Download ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white">
            Analysis Report
          </h2>
          <p className="text-sm text-navy-500 dark:text-gray-400">
            {total_transactions} transactions processed
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <Download className="h-4 w-4" />
          Download Excel Report
        </button>
      </motion.div>

      {/* ── Quick Stats Row ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Total Credit',
            value: fmt(totalCredit),
            icon: ArrowDownRight,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/20',
          },
          {
            label: 'Total Debit',
            value: fmt(totalDebit),
            icon: ArrowUpRight,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/20',
          },
          {
            label: 'Net Flow',
            value: fmt(totalCredit - totalDebit),
            icon: totalCredit - totalDebit >= 0 ? TrendingUp : TrendingDown,
            color: totalCredit - totalDebit >= 0 ? 'text-green-500' : 'text-red-500',
            bg: totalCredit - totalDebit >= 0
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-red-50 dark:bg-red-900/20',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm dark:border-navy-800 dark:bg-navy-900"
          >
            <div className={`rounded-xl p-3 ${s.bg}`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-sm text-navy-500 dark:text-gray-400">{s.label}</p>
              <p className="text-xl font-bold text-navy-900 dark:text-white">
                {s.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Account Details ────────────────────────────────────────── */}
      {Object.keys(account_details).length > 0 && (
        <Section title="Account Details" icon={CreditCard} delay={0.15}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(account_details).map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl bg-navy-50 px-4 py-3 dark:bg-navy-800/50"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-navy-400 dark:text-gray-500">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="mt-1 font-semibold text-navy-900 dark:text-white">
                  {typeof value === 'number' ? fmt(value) : (value || '—')}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Category Summary ───────────────────────────────────────── */}
      {category_summary.length > 0 && (
        <Section title="Spending by Category" icon={Wallet} delay={0.2}>
          <div className="space-y-3">
            {category_summary.map((cat) => {
              const pct = maxDebit > 0 ? ((cat.total_debit / maxDebit) * 100).toFixed(1) : 0;
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColor(cat.category)}`}
                      >
                        {cat.category}
                      </span>
                      <span className="text-navy-400 dark:text-gray-500">
                        ({cat.transaction_count} txns)
                      </span>
                    </div>
                    <span className="font-semibold text-navy-900 dark:text-white">
                      {fmt(cat.total_debit)}
                      {cat.total_credit > 0 && (
                        <span className="ml-2 text-xs text-green-500">
                          +{fmt(cat.total_credit)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Monthly Analysis ───────────────────────────────────────── */}
      {monthly_analysis.length > 0 && (
        <Section title="Monthly Breakdown" icon={CalendarDays} delay={0.25}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {monthly_analysis.map((m, i) => (
              <motion.div
                key={m.month || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 dark:border-navy-700 dark:bg-navy-800/50"
              >
                <p className="font-semibold text-navy-900 dark:text-white">
                  {m.month}
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-navy-500 dark:text-gray-400">Inflow</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {fmt(m.inflows)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-500 dark:text-gray-400">Outflow</span>
                    <span className="font-medium text-red-500">
                      {fmt(m.outflows)}
                    </span>
                  </div>
                  <div className="border-t border-navy-200 pt-2 dark:border-navy-700">
                    <div className="flex justify-between">
                      <span className="text-navy-500 dark:text-gray-400">Net</span>
                      <span className={`font-medium ${m.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        {fmt(m.net)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Top Transactions ───────────────────────────────────────── */}
      {top_transactions.length > 0 && (
        <Section title="Top 5 Transactions" icon={Banknote} delay={0.3}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 dark:border-navy-700">
                  <th className="py-3 pr-4 text-left font-semibold text-navy-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="py-3 pr-4 text-left font-semibold text-navy-500 dark:text-gray-400">
                    Description
                  </th>
                  <th className="py-3 pr-4 text-right font-semibold text-navy-500 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="py-3 text-left font-semibold text-navy-500 dark:text-gray-400">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {top_transactions.map((t, i) => {
                  const amount = t.amount || t.debit || t.credit || 0;
                  const isCredit = (t.type === 'credit' || t.type === 'Credit') || (t.credit > 0 && !t.debit);
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="border-b border-navy-50 last:border-0 dark:border-navy-800"
                    >
                      <td className="py-3 pr-4 text-navy-700 dark:text-gray-300">
                        {t.date}
                      </td>
                      <td className="max-w-[220px] truncate py-3 pr-4 text-navy-900 dark:text-white">
                        {t.description || t.narration}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-navy-900 dark:text-white">
                        {fmt(amount)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isCredit
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownRight className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {t.type || (isCredit ? 'Credit' : 'Debit')}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ── Salary Detection ───────────────────────────────────────── */}
      {salary_detection.length > 0 && (
        <Section title="Salary Detection" icon={Briefcase} delay={0.35}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 dark:border-navy-700">
                  <th className="py-2 pr-4 text-left font-semibold text-navy-500 dark:text-gray-400">Month</th>
                  <th className="py-2 pr-4 text-left font-semibold text-navy-500 dark:text-gray-400">Description</th>
                  <th className="py-2 text-right font-semibold text-navy-500 dark:text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {salary_detection.map((s, i) => (
                  <tr key={i} className="border-b border-navy-50 last:border-0 dark:border-navy-800">
                    <td className="py-2 pr-4 text-navy-700 dark:text-gray-300">{s.month}</td>
                    <td className="max-w-[250px] truncate py-2 pr-4 text-navy-900 dark:text-white">
                      {s.description}
                    </td>
                    <td className="py-2 text-right font-medium text-green-600 dark:text-green-400">
                      {fmt(s.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ── EMI Detection ──────────────────────────────────────────── */}
      {emi_detection.length > 0 && (
        <Section title="EMI / Loan Detection" icon={Building2} delay={0.4}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 dark:border-navy-700">
                  <th className="py-2 pr-4 text-left font-semibold text-navy-500 dark:text-gray-400">Month</th>
                  <th className="py-2 pr-4 text-left font-semibold text-navy-500 dark:text-gray-400">Description</th>
                  <th className="py-2 text-right font-semibold text-navy-500 dark:text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {emi_detection.map((e, i) => (
                  <tr key={i} className="border-b border-navy-50 last:border-0 dark:border-navy-800">
                    <td className="py-2 pr-4 text-navy-700 dark:text-gray-300">{e.month}</td>
                    <td className="max-w-[250px] truncate py-2 pr-4 text-navy-900 dark:text-white">
                      {e.description}
                    </td>
                    <td className="py-2 text-right font-medium text-red-500">
                      {fmt(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ── Categorization Stats ───────────────────────────────────── */}
      {categorization_stats && Object.keys(categorization_stats).length > 0 && (
        <Section title="Categorization Coverage" icon={PieChart} delay={0.45}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-navy-50 px-4 py-3 dark:bg-navy-800/50">
              <p className="text-xs font-medium uppercase tracking-wider text-navy-400 dark:text-gray-500">Total</p>
              <p className="mt-1 text-xl font-bold text-navy-900 dark:text-white">
                {categorization_stats.total || 0}
              </p>
            </div>
            <div className="rounded-xl bg-green-50 px-4 py-3 dark:bg-green-900/20">
              <p className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400">Categorized</p>
              <p className="mt-1 text-xl font-bold text-green-700 dark:text-green-400">
                {categorization_stats.categorized_count || 0}
                <span className="ml-1 text-sm font-normal">({categorization_stats.categorized_pct || 0}%)</span>
              </p>
            </div>
            <div className="rounded-xl bg-orange-50 px-4 py-3 dark:bg-orange-900/20">
              <p className="text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400">Uncategorized</p>
              <p className="mt-1 text-xl font-bold text-orange-700 dark:text-orange-400">
                {categorization_stats.uncategorized_count || 0}
                <span className="ml-1 text-sm font-normal">({categorization_stats.uncategorized_pct || 0}%)</span>
              </p>
            </div>
            <div className="rounded-xl bg-navy-50 px-4 py-3 dark:bg-navy-800/50">
              <p className="text-xs font-medium uppercase tracking-wider text-navy-400 dark:text-gray-500">Coverage</p>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-navy-200 dark:bg-navy-700">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${categorization_stats.categorized_pct || 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ── Bottom download CTA ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center pt-4"
      >
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <Download className="h-5 w-5" />
          Download Full Excel Report
        </button>
      </motion.div>
    </div>
  );
}
