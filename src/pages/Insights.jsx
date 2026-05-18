/**
 * Insights.jsx — PocketWise
 * Spending analytics: donut chart, bar chart, money personality, wastage alerts.
 */

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import SpendingHeatmap from '../components/SpendingHeatmap';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMoneyPersonality, getCategoryEmoji } from '../utils/helpers';

// Category → chart color map
const CAT_COLORS = {
  Food: '#F97316', Transport: '#4A90E2', Study: '#7C6FF7',
  Fun: '#EC4899', 'Pocket Money': '#EAB308', Internship: '#3ECF8E',
  Recharge: '#06B6D4', Other: '#8A92A6', Shopping: '#F43F5E',
};

const Insights = () => {
  const { transactions, getTransactionsByCategory, getWeeklyData } = useApp();

  const cats     = getTransactionsByCategory();
  const weekData = getWeeklyData();
  const personality = getMoneyPersonality(transactions);

  // Donut chart data
  const donutData = cats.map((c) => ({
    name:  c.category,
    value: c.total,
    color: CAT_COLORS[c.category] ?? '#8A92A6',
  }));

  // Bar chart: last 4 months
  const barData = (() => {
    const now    = new Date();
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = d.toLocaleDateString('en-IN', { month: 'short' });
      const mo   = d.getMonth();
      const yr   = d.getFullYear();
      const txs  = transactions.filter((tx) => {
        const txd = new Date(tx.date || tx.createdAt);
        return txd.getMonth() === mo && txd.getFullYear() === yr;
      });
      months.push({
        month:   mKey,
        income:  txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  })();

  // Wastage alerts: top 3 most-frequent small expenses (< ₹200)
  const smallExpenses = transactions.filter((tx) => tx.type === 'expense' && tx.amount < 200);
  const wastageMap    = {};
  smallExpenses.forEach((tx) => {
    const key = tx.category;
    if (!wastageMap[key]) wastageMap[key] = { category: key, count: 0, total: 0 };
    wastageMap[key].count += 1;
    wastageMap[key].total += tx.amount;
  });
  const wastageAlerts = Object.values(wastageMap)
    .filter((w) => w.count >= 2)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // Biggest single expense
  const biggestSpend = transactions
    .filter((tx) => tx.type === 'expense')
    .sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="flex min-h-screen bg-[#F8FAFF] dark:bg-[#0F1117]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-[240px]">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-5xl w-full mx-auto space-y-6">

          <h1 className="text-2xl font-bold text-[#1A1D2E] dark:text-white">PocketWise Insights 📊</h1>

          <SpendingHeatmap />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Donut Chart ────────────────────────────────────────────── */}
            <div className="pw-card">
              <h2 className="pw-section-title mb-1">Spending by Category</h2>
              <p className="pw-section-subtitle mb-4">This month's breakdown</p>
              <DonutChart data={donutData} />
            </div>

            {/* ── Bar Chart ──────────────────────────────────────────────── */}
            <div className="pw-card">
              <h2 className="pw-section-title mb-1">Income vs Expenses</h2>
              <p className="pw-section-subtitle mb-4">Last 4 months</p>
              <BarChart data={barData} />
            </div>
          </div>

          {/* ── Money Personality ───────────────────────────────────────── */}
          <div className="pw-card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-[#4A90E2]/10 dark:to-[#7C6FF7]/10 border border-blue-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{personality.emoji}</span>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Your Money Personality</p>
                <h2 className="text-xl font-bold text-[#1A1D2E] dark:text-white">{personality.label}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{personality.description}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Wastage Alerts ────────────────────────────────────────── */}
            <div className="pw-card">
              <h2 className="pw-section-title mb-1">Wastage Alerts ⚠️</h2>
              <p className="pw-section-subtitle mb-4">Frequent small expenses adding up</p>
              {wastageAlerts.length === 0 ? (
                <div className="text-center py-6 text-textSecondary">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm">No wastage patterns detected. Great job!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wastageAlerts.map((w) => (
                    <div key={w.category} className="flex items-center justify-between p-3 bg-orange-50 rounded-btn">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getCategoryEmoji(w.category)}</span>
                        <div>
                          <p className="text-sm font-semibold text-textPrimary">{w.category}</p>
                          <p className="text-xs text-textSecondary">{w.count} transactions</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-danger">{formatCurrency(w.total)}/mo</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Biggest Spend ─────────────────────────────────────────── */}
            <div className="pw-card">
              <h2 className="pw-section-title mb-1">Biggest Spend 💸</h2>
              <p className="pw-section-subtitle mb-4">Your largest single expense</p>
              {!biggestSpend ? (
                <div className="text-center py-6 text-textSecondary">
                  <p className="text-3xl mb-2">💤</p>
                  <p className="text-sm">No expenses recorded yet.</p>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-btn">
                  <span className="text-4xl">{getCategoryEmoji(biggestSpend.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-textPrimary truncate">{biggestSpend.name || biggestSpend.category}</p>
                    <p className="text-xs text-textSecondary mt-0.5">{biggestSpend.category}</p>
                  </div>
                  <span className="text-xl font-bold text-danger shrink-0">{formatCurrency(biggestSpend.amount)}</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Insights;
