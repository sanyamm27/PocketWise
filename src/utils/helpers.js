/**
 * helpers.js — PocketWise Utility Functions
 */

// ─── Currency ────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupee currency.
 * formatCurrency(1200) → "₹1,200"
 */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

// ─── Dates ───────────────────────────────────────────────────────────────────

/**
 * Format a date string into a human-friendly label.
 * "2024-05-16" → "Today" | "Yesterday" | "May 12"
 */
export const formatDate = (dateStr) => {
  const date  = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getDate()    === b.getDate()    &&
    a.getMonth()   === b.getMonth()   &&
    a.getFullYear()=== b.getFullYear();

  if (isSameDay(date, today))     return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/**
 * Returns how many days remain in the current calendar month (including today).
 */
export const getDaysLeftInMonth = () => {
  const today   = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return lastDay - today.getDate() + 1;
};

/**
 * Calculate how much the user can spend per day to stay within budget.
 * @param {number} balance   — remaining budget (₹)
 * @param {number} daysLeft  — days left in month
 * @returns {number}
 */
export const calculateDailyLimit = (balance, daysLeft) =>
  daysLeft > 0 ? Math.floor(Math.max(balance, 0) / daysLeft) : 0;

// ─── Grouping ─────────────────────────────────────────────────────────────────

/**
 * Group an array of transactions by their date label ("Today", "Yesterday", "May 12", …).
 * @param {Array} transactions
 * @returns {Array<{ label: string, items: Array }>}
 */
export const groupTransactionsByDate = (transactions) => {
  const groups = {};
  [...transactions]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .forEach((tx) => {
      const label = formatDate(tx.date || tx.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    });

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
};

// ─── Category Helpers ─────────────────────────────────────────────────────────

/** Map of category names → emoji */
const CATEGORY_EMOJIS = {
  Food:          '🍔',
  Transport:     '🚌',
  Study:         '📚',
  Fun:           '🎮',
  'Pocket Money':'💰',
  Internship:    '💼',
  Recharge:      '📱',
  Other:         '📦',
  Shopping:      '🛍️',
  Health:        '💊',
  Rent:          '🏠',
  Utilities:     '💡',
};

/**
 * Returns the emoji for a given category name.
 * getCategoryEmoji("Food") → "🍔"
 */
export const getCategoryEmoji = (category) =>
  CATEGORY_EMOJIS[category] ?? '📦';

/** Map of category names → Tailwind bg color class */
const CATEGORY_COLORS = {
  Food:          'bg-orange-100 text-orange-600',
  Transport:     'bg-blue-100   text-blue-600',
  Study:         'bg-purple-100 text-purple-600',
  Fun:           'bg-pink-100   text-pink-600',
  'Pocket Money':'bg-yellow-100 text-yellow-600',
  Internship:    'bg-green-100  text-green-700',
  Recharge:      'bg-cyan-100   text-cyan-600',
  Other:         'bg-gray-100   text-gray-600',
  Shopping:      'bg-rose-100   text-rose-600',
  Health:        'bg-red-100    text-red-600',
  Rent:          'bg-indigo-100 text-indigo-600',
  Utilities:     'bg-lime-100   text-lime-700',
};

/**
 * Returns Tailwind classes for a category bubble.
 * getCategoryColor("Food") → "bg-orange-100 text-orange-600"
 */
export const getCategoryColor = (category) =>
  CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-600';

// ─── Money Personality ────────────────────────────────────────────────────────

/**
 * Analyse spending patterns and return a personality label.
 * @param {Array} transactions
 * @returns {{ label: string, description: string, emoji: string }}
 */
export const getMoneyPersonality = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { label: 'New Saver', description: 'Start tracking to unlock your money personality!', emoji: '🌱' };
  }

  const expenses = transactions.filter((tx) => tx.type === 'expense');
  const income   = transactions.filter((tx) => tx.type === 'income');

  const totalExpense = expenses.reduce((s, tx) => s + tx.amount, 0);
  const totalIncome  = income.reduce((s, tx) => s + tx.amount, 0);

  if (totalIncome === 0) {
    return { label: 'Mindful Spender', description: 'Track your income to get better insights.', emoji: '🧘' };
  }

  const ratio = totalExpense / totalIncome;

  // Fun / entertainment heavy?
  const funSpend = expenses
    .filter((tx) => ['Fun', 'Shopping'].includes(tx.category))
    .reduce((s, tx) => s + tx.amount, 0);
  const funRatio = funSpend / (totalExpense || 1);

  if (ratio > 0.9) {
    return { label: 'Impulsive Buyer', description: 'You spend almost everything you earn. Time to cut back!', emoji: '🛍️' };
  }
  if (funRatio > 0.4) {
    return { label: 'Fun Lover', description: 'You love spending on entertainment. Balance is key!', emoji: '🎮' };
  }
  if (ratio < 0.5) {
    return { label: 'Smart Saver', description: 'You save more than half your income. Amazing discipline!', emoji: '💎' };
  }
  return { label: 'Mindful Spender', description: 'You maintain a healthy balance between spending and saving.', emoji: '🧘' };
};
