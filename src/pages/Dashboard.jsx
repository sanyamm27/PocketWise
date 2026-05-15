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
import { useApp } from '../context/AppContext';
import { formatCurrency, getCategoryEmoji } from '../utils/helpers';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-5xl w-full mx-auto space-y-6">

          {/* ── Greeting ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary">
                {getGreeting()}, {user?.displayName?.split(' ')[0] ?? 'there'} 👋
              </h1>
              <p className="text-sm text-textSecondary mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <StreakBadge streakCount={streakCount} />
          </div>

          {/* ── Hero Balance Card ──────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-primary to-accent rounded-card p-6 text-white shadow-card-hover">
            <p className="text-sm font-medium opacity-75">Total Balance</p>
            <p className="text-5xl font-bold mt-1 mb-5 tracking-tight">{formatCurrency(balance)}</p>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp size={14} />
                </div>
                <div>
                  <p className="text-xs opacity-70">Income</p>
                  <p className="text-base font-semibold">{formatCurrency(income)}</p>
                </div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingDown size={14} />
                </div>
                <div>
                  <p className="text-xs opacity-70">Expenses</p>
                  <p className="text-base font-semibold">{formatCurrency(expense)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick Actions ─────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => openModal('income')}
              className="flex flex-col items-center gap-2 py-4 px-3 bg-white rounded-card shadow-card
                         border-2 border-transparent hover:border-success hover:shadow-card-hover
                         transition-all duration-150 group"
            >
              <div className="w-10 h-10 rounded-full bg-green-50 group-hover:bg-success flex items-center justify-center transition-colors">
                <TrendingUp size={18} className="text-success group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs font-semibold text-textPrimary text-center leading-tight">+ Add Income</span>
            </button>
            <button
              onClick={() => openModal('expense')}
              className="flex flex-col items-center gap-2 py-4 px-3 bg-white rounded-card shadow-card
                         border-2 border-transparent hover:border-danger hover:shadow-card-hover
                         transition-all duration-150 group"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 group-hover:bg-danger flex items-center justify-center transition-colors">
                <TrendingDown size={18} className="text-danger group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs font-semibold text-textPrimary text-center leading-tight">+ Add Expense</span>
            </button>
            <button
              onClick={() => navigate('/survive')}
              className="flex flex-col items-center gap-2 py-4 px-3 bg-white rounded-card shadow-card
                         border-2 border-transparent hover:border-accent hover:shadow-card-hover
                         transition-all duration-150 group"
            >
              <div className="w-10 h-10 rounded-full bg-purple-50 group-hover:bg-accent flex items-center justify-center transition-colors">
                <Zap size={18} className="text-accent group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs font-semibold text-textPrimary text-center leading-tight">Survive Mode</span>
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
                <div className="text-center py-10 text-textSecondary">
                  <p className="text-4xl mb-2">💸</p>
                  <p className="text-sm font-medium text-textPrimary">No transactions yet</p>
                  <p className="text-xs mt-1">Tap + to log your first entry!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((tx) => <TransactionCard key={tx.id} {...tx} />)}
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
                <div className="text-center py-10 text-textSecondary">
                  <p className="text-4xl mb-2">🎯</p>
                  <p className="text-sm font-medium text-textPrimary">No spending yet</p>
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
