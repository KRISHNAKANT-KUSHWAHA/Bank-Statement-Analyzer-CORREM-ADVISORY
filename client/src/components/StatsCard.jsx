import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatsCard – reusable metric card with icon, title, value, and optional subtitle.
 *
 * Props:
 *   icon      – Lucide icon component
 *   title     – label text
 *   value     – main metric
 *   subtitle  – optional secondary text
 *   gradient  – tailwind gradient classes (default navy→navy)
 */
export default function StatsCard({
  icon: Icon,
  title,
  value,
  subtitle,
  gradient = 'from-navy-800 to-navy-700',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(10, 22, 40, 0.18)' }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg`}
    >
      {/* decorative circle */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-white/50">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-white/10 p-3">
            <Icon className="h-6 w-6 text-gold-400" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
