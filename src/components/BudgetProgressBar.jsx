/**
 * BudgetProgressBar.jsx — PocketWise
 * Animated progress bar that changes color at 60% / 85% / 100% thresholds.
 */

import { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/helpers';
import { AlertTriangle } from 'lucide-react';

const BudgetProgressBar = ({ category, spent, total, emoji }) => {
  const [width, setWidth] = useState(0);

  const pct    = total > 0 ? (spent / total) * 100 : 0;
  const capped = Math.min(pct, 100);

  // Determine bar color based on percentage
  const barColor =
    pct >= 100 ? 'bg-danger'
    : pct >= 85 ? 'bg-orange-400'
    : 'bg-success';

  // Warning / danger messages
  const warningMsg =
    pct >= 100 ? 'Budget exceeded!'
    : pct >= 85 ? 'Almost at limit!'
    : null;

  // Animate bar width on mount
  useEffect(() => {
    const t = setTimeout(() => setWidth(capped), 80);
    return () => clearTimeout(t);
  }, [capped]);

  return (
    <div className="py-2">
      {/* ── Header row ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{emoji}</span>
          <span className="text-sm font-semibold text-textPrimary">{category}</span>
        </div>
        <div className="flex items-center gap-2">
          {warningMsg && (
            <span
              className={`flex items-center gap-1 text-xs font-semibold ${
                pct >= 100 ? 'text-danger' : 'text-orange-500'
              }`}
            >
              <AlertTriangle size={12} />
              {warningMsg}
            </span>
          )}
          <span className="text-xs text-textSecondary">
            {formatCurrency(spent)}
            <span className="text-gray-300 mx-1">/</span>
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* ── Progress track ──────────────────────────────────────────── */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* ── Percentage label ─────────────────────────────────────────── */}
      <p className={`text-xs mt-1 text-right font-medium ${
        pct >= 100 ? 'text-danger' : pct >= 85 ? 'text-orange-500' : 'text-textSecondary'
      }`}>
        {Math.round(pct)}% used
      </p>
    </div>
  );
};

export default BudgetProgressBar;
