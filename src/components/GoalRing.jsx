/**
 * GoalRing.jsx — PocketWise
 * SVG circular progress ring with animated fill and center label.
 * Props: goalName, saved, target
 */

import { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/helpers';

const GoalRing = ({ goalName = 'Goal', saved = 0, target = 1, emoji = '🎯' }) => {
  const [animPct, setAnimPct] = useState(0);

  const pct       = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  const isAbove50 = pct >= 50;

  // SVG ring params
  const SIZE   = 120;
  const STROKE = 10;
  const R      = (SIZE - STROKE) / 2;
  const CIRC   = 2 * Math.PI * R;
  const offset = CIRC - (animPct / 100) * CIRC;
  const cx     = SIZE / 2;
  const cy     = SIZE / 2;

  // Animate from 0 → pct on mount
  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  const ringColor = isAbove50 ? '#3ECF8E' : '#4A90E2';

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {/* ── SVG Ring ──────────────────────────────────────────────────── */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden="true">
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke="#F1F4F9"
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl font-bold"
            style={{ color: ringColor }}
          >
            {Math.round(pct)}%
          </span>
          <span className="text-[10px] text-textSecondary font-medium">Saved</span>
        </div>
      </div>

      {/* ── Goal Info ─────────────────────────────────────────────────── */}
      <div className="text-center">
        <p className="text-sm font-semibold text-textPrimary">
          {emoji} {goalName}
        </p>
        <p className="text-xs text-textSecondary mt-0.5">
          {formatCurrency(saved)}
          <span className="text-gray-300 mx-1">/</span>
          {formatCurrency(target)}
        </p>
      </div>
    </div>
  );
};

export default GoalRing;
