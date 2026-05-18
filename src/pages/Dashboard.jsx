/**
 * Dashboard.jsx — PocketWise Main Dashboard
 */

import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TransactionCard from '../components/TransactionCard';
import AddTransactionModal from '../components/AddTransactionModal';
import StreakBadge from '../components/StreakBadge';
import BudgetProgressBar from '../components/BudgetProgressBar';
import HealthScore from '../components/HealthScore';
import AIAdvice from '../components/AIAdvice';
import WeeklyReport from '../components/WeeklyReport';
import { useApp } from '../context/AppContext';
import { formatCurrency, getCategoryEmoji } from '../utils/helpers';

// ─── Greeting helpers ─────────────────────────────────────────────────────────
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

const formatName = (name) => {
  if (!name) return 'there';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const Dashboard = () => {
  const { transactions, user, getTotalIncome, getTotalExpense, getBalance, getTransactionsByCategory, monthlyBudget } = useApp();
  const navigate = useNavigate();
  const [modalOpen,      setModalOpen]      = useState(false);
  const [modalInitType,  setModalInitType]  = useState('expense');

  const income  = getTotalIncome();
  const expense = getTotalExpense();
  const balance = getBalance();
  const cats    = getTransactionsByCategory().slice(0, 3);

  // Streak: consecutive days with ≥1 transaction
  const streakCount = (() => {
    const days = new Set(transactions.map((tx) => new Date(tx.date || tx.createdAt).toDateString()));
    let count = 0; const d = new Date();
    while (days.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
    return count;
  })();

  const openModal = (type) => { setModalInitType(type); setModalOpen(true); };

  return (
    <div className="flex min-h-screen bg-[#F8FAFF] dark:bg-[#0F1117]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-[240px]">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-5xl w-full mx-auto space-y-6">

          {/* ── Greeting ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1D2E] dark:text-white">
                Good {getTimeOfDay()}, {formatName(user?.displayName)} 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <StreakBadge streakCount={streakCount} />
          </div>

          {/* ── Hero Balance Card ──────────────────────────────────────── */}
          <div className="relative bg-gradient-to-r from-[#4A90E2] to-[#7C6FF7] rounded-3xl p-6 lg:p-8 text-white shadow-2xl overflow-hidden animate-fadeInUp w-full">
            {/* Subtle animated background circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-15 animate-pulse-soft -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full mix-blend-overlay filter blur-2xl opacity-15 animate-pulse-soft translate-y-1/2 -translate-x-1/4"></div>
            
            <div className="relative z-10">
              <p className="text-sm font-medium opacity-80">Total Balance</p>
              <p className="text-5xl font-bold mt-1 mb-6 tracking-tight">{formatCurrency(balance)}</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-3 bg-white/20 rounded-2xl px-4 py-3 backdrop-blur-sm flex-1">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-xs opacity-80">Income</p>
                    <p className="text-sm font-bold">{formatCurrency(income)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/20 rounded-2xl px-4 py-3 backdrop-blur-sm flex-1">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <TrendingDown size={16} />
                  </div>
                  <div>
                    <p className="text-xs opacity-80">Expenses</p>
                    <p className="text-sm font-bold">{formatCurrency(expense)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Health Score ──────────────────────────────────────────── */}
          <HealthScore />

          {/* ── AI Advice ─────────────────────────────────────────────── */}
          <AIAdvice />

          {/* ── Weekly Report ─────────────────────────────────────────── */}
          <WeeklyReport />

          {/* ── Quick Actions ─────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <button
              onClick={() => openModal('income')}
              className="flex flex-col items-center gap-2 sm:gap-3 py-4 sm:py-5 px-1 sm:px-3 bg-white dark:bg-[#1A1D2E] rounded-2xl shadow-md border-2 border-transparent hover:border-success hover:shadow-xl hover:-translate-y-1 transition-all duration-200 animate-slideInLeft delay-100 group w-full"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 dark:bg-[#4A90E2]/10 group-hover:bg-[#4A90E2] flex items-center justify-center transition-colors shrink-0">
                <TrendingUp size={20} className="text-[#4A90E2] group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-[#1A1D2E] dark:text-white text-center leading-tight">Add Income</span>
            </button>
            <button
              onClick={() => openModal('expense')}
              className="flex flex-col items-center gap-2 sm:gap-3 py-4 sm:py-5 px-1 sm:px-3 bg-white dark:bg-[#1A1D2E] rounded-2xl shadow-md border-2 border-transparent hover:border-danger hover:shadow-xl hover:-translate-y-1 transition-all duration-200 animate-slideInLeft delay-200 group w-full"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 dark:bg-red-500/10 group-hover:bg-danger flex items-center justify-center transition-colors shrink-0">
                <TrendingDown size={20} className="text-danger group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-[#1A1D2E] dark:text-white text-center leading-tight">Add Expense</span>
            </button>
            <button
              onClick={() => navigate('/survive')}
              className="flex flex-col items-center gap-2 sm:gap-3 py-4 sm:py-5 px-1 sm:px-3 bg-white dark:bg-[#1A1D2E] rounded-2xl shadow-md border-2 border-transparent hover:border-accent hover:shadow-xl hover:-translate-y-1 transition-all duration-200 animate-slideInLeft delay-300 group w-full"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-50 dark:bg-[#7C6FF7]/10 group-hover:bg-[#7C6FF7] flex items-center justify-center transition-colors shrink-0">
                <Zap size={20} className="text-[#7C6FF7] group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-[#1A1D2E] dark:text-white text-center leading-tight">Survive Mode</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Recent Transactions ──────────────────────────────────── */}
            <div className="pw-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="pw-section-title">Recent Transactions</h2>
                <a href="/transactions" className="text-xs text-primary font-semibold hover:underline">View all</a>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <p className="text-4xl mb-2">💸</p>
                  <p className="text-sm font-medium text-[#1A1D2E] dark:text-white">No transactions yet</p>
                  <p className="text-xs mt-1">Tap + to log your first entry!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx, idx) => (
                    <div key={tx.id} className={`animate-fadeInUp delay-${(idx + 1) * 100}`}>
                      <TransactionCard {...tx} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Budget Overview ───────────────────────────────────────── */}
            <div className="pw-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="pw-section-title">Budget Overview</h2>
                <a href="/budget" className="text-xs text-primary font-semibold hover:underline">Manage</a>
              </div>
              {cats.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <p className="text-4xl mb-2">🎯</p>
                  <p className="text-sm font-medium text-[#1A1D2E] dark:text-white">No spending yet</p>
                  <p className="text-xs mt-1">Your category budgets will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {cats.map((c) => (
                    <BudgetProgressBar
                      key={c.category}
                      category={c.category}
                      emoji={getCategoryEmoji(c.category)}
                      spent={c.total}
                      total={monthlyBudget / 4}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <button
        onClick={() => openModal('expense')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-modal
                   flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all z-40"
        aria-label="Add transaction"
      >
        <Plus size={26} />
      </button>

      <AddTransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
