/**
 * TransactionCard.jsx — PocketWise
 * Single transaction row with emoji, name, date, amount, and delete on hover.
 */

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryEmoji, getCategoryColor } from '../utils/helpers';
import { useApp } from '../context/AppContext';

const TransactionCard = ({ id, name, amount, category, date, type }) => {
  const { deleteTransaction } = useApp();
  const [hovered, setHovered] = useState(false);

  const emoji      = getCategoryEmoji(category);
  const colorClass = getCategoryColor(category);
  const isIncome   = type === 'income';

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 bg-white rounded-card
                  border border-transparent transition-all duration-200 group
                  ${hovered ? 'shadow-card-hover border-gray-100 -translate-y-px' : 'shadow-card'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Category Emoji Bubble ──────────────────────────────────────── */}
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center
                    text-xl shrink-0 ${colorClass}`}
        aria-label={category}
      >
        {emoji}
      </div>

      {/* ── Name + Date ────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-textPrimary truncate">{name}</p>
        <p className="text-xs text-textSecondary mt-0.5">
          {category} · {formatDate(date)}
        </p>
      </div>

      {/* ── Amount + Delete ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`text-sm font-bold ${isIncome ? 'text-success' : 'text-danger'}`}
        >
          {isIncome ? '+' : '-'}{formatCurrency(amount)}
        </span>

        {/* Delete — visible on hover */}
        <button
          onClick={() => deleteTransaction(id)}
          className={`p-1.5 rounded-btn text-textSecondary
                      hover:bg-red-50 hover:text-danger
                      transition-all duration-150
                      ${hovered ? 'opacity-100' : 'opacity-0'}`}
          aria-label={`Delete transaction: ${name}`}
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;
