import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Category color hex mapping to align with design tokens
const CATEGORY_COLORS_HEX = {
  'Salary': '#22C55E',        // Green
  'Food & Dining': '#F97316', // Orange
  'Shopping': '#EC4899',      // Pink
  'UPI/Transfer': '#3B82F6',  // Blue
  'EMI/Loan': '#EF4444',      // Red
  'Investments': '#6366F1',   // Indigo
  'Utilities': '#EAB308',     // Yellow
  'Rent': '#A855F7',          // Purple
  'Insurance': '#14B8A6',     // Teal
  'Entertainment': '#D946EF', // Fuchsia
  'Travel': '#06B6D4',        // Cyan
  'Education': '#8B5CF6',     // Violet
  'Healthcare': '#10B981',    // Emerald
  'Cash Withdrawal': '#F59E0B',// Amber
  'Telecom': '#0EA5E9',       // Sky
  'Other': '#6B7280',         // Gray
  'default': '#9CA3AF'
};

const getCategoryColor = (cat) => CATEGORY_COLORS_HEX[cat] || CATEGORY_COLORS_HEX.default;

const fmt = (n) => {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
};

/* ═══════════════════════════════════════════════════════════════════════
   CATEGORY DONUT CHART COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export function CategoryDonutChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Filter categories with positive debit to make spending chart meaningful
  const debitCategories = data
    .filter((c) => (c.total_debit || 0) > 0)
    .sort((a, b) => b.total_debit - a.total_debit);

  const totalDebitSum = debitCategories.reduce((s, c) => s + c.total_debit, 0);

  useEffect(() => {
    let start;
    const duration = 750; // ms
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    const reqId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqId);
  }, [data]);

  if (debitCategories.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-navy-400 dark:text-gray-500">
        No debit data to display in chart.
      </div>
    );
  }

  // Dimensions
  const cx = 150;
  const cy = 150;
  const rIn = 70;
  const rOut = 100;
  const size = 300;

  // Compute angles for slices
  let currentAngle = 0;
  const slices = debitCategories.map((c, index) => {
    const percentage = totalDebitSum > 0 ? (c.total_debit / totalDebitSum) * 100 : 0;
    const angleRange = totalDebitSum > 0 ? (c.total_debit / totalDebitSum) * 360 : 0;
    
    const slice = {
      category: c.category,
      total_debit: c.total_debit,
      transaction_count: c.transaction_count,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angleRange,
      color: getCategoryColor(c.category),
      index
    };
    currentAngle += angleRange;
    return slice;
  });

  const getDonutSlicePath = (cx, cy, innerRadius, outerRadius, startAngle, endAngle) => {
    // Offset angles by -90 to start drawing from 12 o'clock position
    const degToRad = (deg) => (deg - 90) * Math.PI / 180;
    
    // Scale angles by animationProgress
    const scaledStartAngle = startAngle * animationProgress;
    const scaledEndAngle = endAngle * animationProgress;

    // Handle full circle
    const diff = scaledEndAngle - scaledStartAngle;
    if (diff >= 359.9) {
      return `M ${cx} ${cy - outerRadius}
              A ${outerRadius} ${outerRadius} 0 1 1 ${cx - 0.01} ${cy - outerRadius}
              Z
              M ${cx} ${cy - innerRadius}
              A ${innerRadius} ${innerRadius} 0 1 0 ${cx - 0.01} ${cy - innerRadius}
              Z`;
    }

    const startRad = degToRad(scaledStartAngle);
    const endRad = degToRad(scaledEndAngle);

    const x1 = cx + outerRadius * Math.cos(startRad);
    const y1 = cy + outerRadius * Math.sin(startRad);
    const x2 = cx + outerRadius * Math.cos(endRad);
    const y2 = cy + outerRadius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArcFlag = diff > 180 ? 1 : 0;

    return [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
  };

  // Currently shown center info (defaults to total spent or hovered slice)
  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-around lg:gap-4">
      {/* ── Circle SVG Container ───────────────────────────────────── */}
      <div className="relative h-[300px] w-[300px] select-none">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full overflow-visible">
          {slices.map((slice, i) => {
            const isHovered = hoveredIndex === i;
            const currentOuterRad = isHovered ? rOut + 6 : rOut;
            const currentInnerRad = isHovered ? rIn - 2 : rIn;
            return (
              <path
                key={slice.category}
                d={getDonutSlicePath(cx, cy, currentInnerRad, currentOuterRad, slice.startAngle, slice.endAngle)}
                fill={slice.color}
                className="transition-all duration-300 ease-out cursor-pointer hover:opacity-90"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  filter: isHovered ? 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.15))' : 'none',
                }}
              />
            );
          })}
        </svg>

        {/* ── Central Details Panel (Glassmorphic look inside) ───────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {activeSlice ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="px-6"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-navy-400 dark:text-gray-500 max-w-[130px] truncate mx-auto">
                {activeSlice.category}
              </p>
              <p className="mt-1 text-lg font-extrabold text-navy-900 dark:text-white">
                {fmt(activeSlice.total_debit)}
              </p>
              <p className="text-xs text-navy-500 dark:text-gray-400 font-semibold">
                {activeSlice.percentage.toFixed(1)}% ({activeSlice.transaction_count} txns)
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-navy-400 dark:text-gray-500">
                Total Debit
              </p>
              <p className="mt-1 text-xl font-black text-navy-900 dark:text-white">
                {fmt(totalDebitSum)}
              </p>
              <p className="text-[10px] text-navy-400 dark:text-gray-500 font-medium">
                Hover slice for details
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Legend List ────────────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-sm">
        <h4 className="mb-3 text-sm font-bold text-navy-800 dark:text-gray-300">Category Legend</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 max-h-60 overflow-y-auto pr-1">
          {slices.map((slice, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <div
                key={slice.category}
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isHovered ? 'bg-navy-50 dark:bg-navy-800' : 'hover:bg-navy-50/50 dark:hover:bg-navy-800/30'
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-navy-900 dark:text-white leading-tight">
                    {slice.category}
                  </p>
                  <p className="text-[10px] text-navy-400 dark:text-gray-500 font-medium">
                    {slice.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MONTHLY BAR CHART COMPONENT (Inflow vs Outflow)
   ═══════════════════════════════════════════════════════════════════════ */
export function MonthlyBarChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    let start;
    const duration = 800; // ms
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    const reqId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqId);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-navy-400 dark:text-gray-500">
        No monthly breakdown to display in chart.
      </div>
    );
  }

  // Dimensions
  const w = 600;
  const h = 280;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = w - paddingLeft - paddingRight;
  const chartHeight = h - paddingTop - paddingBottom;

  // Scaling limits
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.inflows || 0, d.outflows || 0]),
    10000 // default min height scale
  );

  // Clean rounding logic for grid lines
  const steps = 4;
  const getGridValues = () => {
    const gridVals = [];
    for (let i = 0; i <= steps; i++) {
      gridVals.push((maxVal / steps) * i);
    }
    return gridVals;
  };

  const gridValues = getGridValues();

  // Helper: map data value to chart Y position
  const getY = (val) => {
    const ratio = maxVal > 0 ? val / maxVal : 0;
    return paddingTop + chartHeight * (1 - ratio);
  };

  // Helper: format Y label amounts to compact representation
  const formatYLabel = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  // Bar group settings
  const monthCount = data.length;
  const colWidth = chartWidth / monthCount;
  const gap = colWidth * 0.25;
  const barWidth = (colWidth - gap) / 2;

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden select-none">
      {/* ── SVG Chart Canvas ────────────────────────────────────────── */}
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible">
        {/* Gradients */}
        <defs>
          <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid Lines & Y Axis Labels */}
        {gridValues.map((gridVal, i) => {
          const yPos = getY(gridVal);
          return (
            <g key={i} className="opacity-40 dark:opacity-20">
              <line
                x1={paddingLeft}
                y1={yPos}
                x2={w - paddingRight}
                y2={yPos}
                stroke="#6B7280"
                strokeWidth="0.8"
                strokeDasharray="4,4"
              />
              <text
                x={paddingLeft - 10}
                y={yPos + 4}
                textAnchor="end"
                className="text-[10px] font-semibold fill-navy-600 dark:fill-gray-400"
              >
                {formatYLabel(gridVal)}
              </text>
            </g>
          );
        })}

        {/* Columns & Bars */}
        {data.map((m, idx) => {
          const leftStart = paddingLeft + idx * colWidth + gap / 2;

          // Inflow bar variables
          const inflowHeight = (chartHeight * (m.inflows || 0)) / maxVal;
          const animatedInflowH = inflowHeight * animationProgress;
          const inflowY = paddingTop + chartHeight - animatedInflowH;

          // Outflow bar variables
          const outflowHeight = (chartHeight * (m.outflows || 0)) / maxVal;
          const animatedOutflowH = outflowHeight * animationProgress;
          const outflowY = paddingTop + chartHeight - animatedOutflowH;

          const isHoveredCol = hoveredIdx === idx;

          return (
            <g
              key={m.month || idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Highlight Column Background on Hover */}
              {isHoveredCol && (
                <rect
                  x={paddingLeft + idx * colWidth}
                  y={paddingTop - 5}
                  width={colWidth}
                  height={chartHeight + 10}
                  className="fill-navy-100/30 dark:fill-navy-800/40 rounded"
                />
              )}

              {/* Inflow Bar (Green) */}
              {m.inflows > 0 && (
                <rect
                  x={leftStart}
                  y={inflowY}
                  width={barWidth}
                  height={animatedInflowH}
                  fill="url(#inflowGrad)"
                  rx="3"
                  className="transition-all duration-300"
                />
              )}

              {/* Outflow Bar (Red) */}
              {m.outflows > 0 && (
                <rect
                  x={leftStart + barWidth}
                  y={outflowY}
                  width={barWidth}
                  height={animatedOutflowH}
                  fill="url(#outflowGrad)"
                  rx="3"
                  className="transition-all duration-300"
                />
              )}

              {/* X Axis Month Label */}
              <text
                x={paddingLeft + idx * colWidth + colWidth / 2}
                y={h - paddingBottom + 18}
                textAnchor="middle"
                className={`text-[11px] font-bold transition-colors ${
                  isHoveredCol ? 'fill-gold-600 dark:fill-gold-400 font-extrabold' : 'fill-navy-600 dark:fill-gray-400'
                }`}
              >
                {m.month}
              </text>
            </g>
          );
        })}

        {/* X Axis Baseline */}
        <line
          x1={paddingLeft}
          y1={h - paddingBottom}
          x2={w - paddingRight}
          y2={h - paddingBottom}
          stroke="#9CA3AF"
          strokeWidth="1.5"
          className="opacity-50 dark:opacity-30"
        />
      </svg>

      {/* ── Bottom Legend ──────────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-6 rounded bg-gradient-to-r from-green-500 to-green-700" />
          <span className="text-xs font-semibold text-navy-700 dark:text-gray-300">Inflows (Credits)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-6 rounded bg-gradient-to-r from-red-500 to-red-700" />
          <span className="text-xs font-semibold text-navy-700 dark:text-gray-300">Outflows (Debits)</span>
        </div>
      </div>

      {/* ── Hover Tooltip ──────────────────────────────────────────── */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute border border-navy-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-navy-800 dark:bg-navy-900/95 rounded-xl text-left pointer-events-none z-10 max-w-[200px]"
          style={{
            // Compute a clean coordinate relative to container dimensions
            left: `${Math.min(
              Math.max(
                ((paddingLeft + hoveredIdx * colWidth + colWidth / 2) / w) * 100,
                15
              ),
              85
            )}%`,
            top: '10px',
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-xs font-bold text-navy-900 dark:text-white border-b border-navy-100 dark:border-navy-800 pb-1 mb-1.5">
            {data[hoveredIdx].month}
          </p>
          <div className="space-y-1 text-[11px] font-semibold">
            <div className="flex justify-between gap-4">
              <span className="text-navy-500 dark:text-gray-400">Inflow:</span>
              <span className="text-green-600 dark:text-green-400">{fmt(data[hoveredIdx].inflows)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-navy-500 dark:text-gray-400">Outflow:</span>
              <span className="text-red-500">{fmt(data[hoveredIdx].outflows)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-navy-100 dark:border-navy-800 pt-1 mt-1 font-bold">
              <span className="text-navy-700 dark:text-gray-300">Net:</span>
              <span className={data[hoveredIdx].net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                {fmt(data[hoveredIdx].net)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
