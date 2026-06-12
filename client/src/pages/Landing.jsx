import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  FileSearch,
  Tags,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  History,
  ArrowRight,
  Upload,
  Cpu,
  LineChart,
  Download,
  Landmark,
  ChevronRight,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL-ANIMATED WRAPPER
   ═══════════════════════════════════════════════════════════════════════ */
function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FEATURES DATA
   ═══════════════════════════════════════════════════════════════════════ */
const features = [
  {
    icon: FileSearch,
    title: 'PDF Parsing',
    description:
      'Smart text extraction with OCR fallback ensures every transaction is captured accurately from your HDFC statements.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Tags,
    title: 'Auto Categorization',
    description:
      '16+ intelligent categories — Salary, EMI, Shopping, Dining, Rent, Utilities, and more — classified automatically.',
    color: 'from-purple-500 to-fuchsia-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Monthly trends, credit/debit summaries, top transactions, and net-flow insights — all in one glance.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FileSpreadsheet,
    title: 'Excel Export',
    description:
      'Download professionally formatted .xlsx reports with category breakdowns, charts, and summary sheets.',
    color: 'from-orange-500 to-amber-600',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    description:
      'Your data stays encrypted in transit and at rest. We never share your financial information with third parties.',
    color: 'from-red-500 to-rose-600',
  },
  {
    icon: History,
    title: 'Analysis History',
    description:
      'Every analysis is saved to your account so you can revisit, compare, and re-download reports at any time.',
    color: 'from-cyan-500 to-sky-600',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   HOW IT WORKS STEPS
   ═══════════════════════════════════════════════════════════════════════ */
const steps = [
  {
    icon: Upload,
    title: 'Upload PDF',
    desc: 'Drag & drop or browse for your HDFC bank statement PDF.',
  },
  {
    icon: Cpu,
    title: 'AI Analysis',
    desc: 'Our engine parses, categorizes, and analyzes every transaction.',
  },
  {
    icon: LineChart,
    title: 'View Insights',
    desc: 'Explore interactive dashboards with monthly trends & categories.',
  },
  {
    icon: Download,
    title: 'Export Report',
    desc: 'Download a professionally formatted Excel report instantly.',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function Landing() {
  return (
    <div className="overflow-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl animate-pulse" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-navy-400/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold-400/5 blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating bank documents */}
        <div className="pointer-events-none absolute inset-0">
          {[
            { top: '12%', left: '8%', delay: '0s', size: 'h-16 w-12' },
            { top: '22%', right: '12%', delay: '1.5s', size: 'h-14 w-10' },
            { bottom: '18%', left: '15%', delay: '3s', size: 'h-12 w-9' },
            { bottom: '25%', right: '10%', delay: '0.5s', size: 'h-16 w-12' },
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos.size} rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm`}
              style={{
                top: pos.top,
                left: pos.left,
                right: pos.right,
                bottom: pos.bottom,
                animation: `float 6s ease-in-out infinite`,
                animationDelay: pos.delay,
              }}
            >
              <div className="m-2 space-y-1">
                <div className="h-1 w-3/4 rounded bg-white/20" />
                <div className="h-1 w-1/2 rounded bg-white/10" />
                <div className="h-1 w-2/3 rounded bg-gold-500/20" />
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33% { transform: translateY(-18px) rotate(2deg); }
            66% { transform: translateY(-8px) rotate(-1deg); }
          }
        `}</style>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/25">
              <Landmark className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Analyze Your HDFC
              <br />
              <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
                Bank Statements
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-200 sm:text-xl">
              Upload your PDF statement and get instant insights — categorized
              transactions, monthly trends, salary & EMI detection, and
              professional Excel reports.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              to="/signup"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-gold-500/25 hover:shadow-xl hover:shadow-gold-500/30 transition-all"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              Learn More
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section
        id="features"
        className="relative bg-gray-50 py-24 dark:bg-navy-950"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-gold-500">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-navy-900 dark:text-white sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-navy-500 dark:text-gray-400">
              A comprehensive suite of tools designed to give you full visibility
              into your financial health.
            </p>
          </FadeIn>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="group relative rounded-2xl border border-navy-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-navy-800 dark:bg-navy-900">
                  <div
                    className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${f.color} p-3 text-white shadow-md`}
                  >
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-500 dark:text-gray-400">
                    {f.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="relative bg-white py-24 dark:bg-navy-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-gold-500">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-navy-900 dark:text-white sm:text-4xl">
              Four Simple Steps
            </h2>
          </FadeIn>

          <div className="relative mt-16">
            {/* Connecting line (desktop) */}
            <div className="absolute left-1/2 top-10 hidden h-[calc(100%-80px)] w-0.5 -translate-x-1/2 bg-gradient-to-b from-gold-400 to-gold-600 lg:block" />

            <div className="grid gap-12 lg:gap-0">
              {steps.map((s, i) => (
                <FadeIn key={s.title} delay={i * 0.12}>
                  <div
                    className={`flex flex-col items-center gap-6 lg:flex-row ${
                      i % 2 !== 0 ? 'lg:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Card */}
                    <div className="flex-1">
                      <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-6 dark:border-navy-700 dark:bg-navy-800/50">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-md">
                            <s.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
                              Step {i + 1}
                            </p>
                            <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                              {s.title}
                            </h3>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-navy-500 dark:text-gray-400">
                          {s.desc}
                        </p>
                      </div>
                    </div>

                    {/* Step number (timeline dot, desktop) */}
                    <div className="relative z-10 hidden lg:flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-gold-500 bg-white text-sm font-bold text-gold-600 dark:bg-navy-900">
                      {i + 1}
                    </div>

                    {/* Spacer for the other side */}
                    <div className="hidden flex-1 lg:block" />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 py-20">
        <FadeIn className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-navy-300">
            Create your free account and analyze your first statement in under a
            minute.
          </p>
          <div className="mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-10 py-4 text-base font-bold text-white shadow-lg shadow-gold-500/25 hover:shadow-xl transition-all"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-navy-100 bg-white py-8 dark:border-navy-800 dark:bg-navy-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-gold-500" />
            <span className="text-sm font-bold text-navy-900 dark:text-white">
              HDFC <span className="text-gold-500">Analyzer</span>
            </span>
          </div>
          <p className="text-sm text-navy-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} HDFC Bank Statement Analyzer. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
