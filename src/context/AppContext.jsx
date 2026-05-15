/**
 * AppContext.jsx — PocketWise Global State
 * Provides app-wide state and actions via React Context.
 * All data is persisted to localStorage.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const KEYS = {
  TRANSACTIONS:   'pw_transactions',
  MONTHLY_BUDGET: 'pw_monthly_budget',
  GOALS:          'pw_goals',
  USER:           'pw_user',
};

// ─── Default Goals ────────────────────────────────────────────────────────────
const DEFAULT_GOALS = [
  { id: 'g1', name: 'New Laptop',  target: 45000, saved: 12000, emoji: '💻', deadline: '2025-12-31' },
  { id: 'g2', name: 'Trip to Goa', target: 15000, saved: 4500,  emoji: '✈️', deadline: '2025-05-30' },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* silent */ }
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }) => {
  const [transactions,  setTransactions]  = useState(() => load(KEYS.TRANSACTIONS,   []));
  const [user,          setUser]          = useState(() => load(KEYS.USER,           null));
  const [monthlyBudget, setMonthlyBudget] = useState(() => load(KEYS.MONTHLY_BUDGET, 8000));
  const [goals,         setGoals]         = useState(() => load(KEYS.GOALS,          DEFAULT_GOALS));

  // Sync state → localStorage
  useEffect(() => save(KEYS.TRANSACTIONS,   transactions),   [transactions]);
  useEffect(() => save(KEYS.MONTHLY_BUDGET, monthlyBudget), [monthlyBudget]);
  useEffect(() => save(KEYS.GOALS,          goals),          [goals]);
  useEffect(() => save(KEYS.USER,           user),           [user]);

  // ── Transaction Actions ───────────────────────────────────────────────────
  const addTransaction = useCallback((tx) => {
    const newTx = { ...tx, id: crypto.randomUUID(), amount: Math.abs(Number(tx.amount)), createdAt: new Date().toISOString() };
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id) =>
    setTransactions((prev) => prev.filter((tx) => tx.id !== id)), []);

  const updateTransaction = useCallback((id, updates) =>
    setTransactions((prev) => prev.map((tx) => tx.id === id ? { ...tx, ...updates } : tx)), []);

  // ── Computed (current month) ──────────────────────────────────────────────
  const thisMonth = useCallback((tx) => {
    const now = new Date(); const d = new Date(tx.date || tx.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }, []);

  const getTotalIncome  = useCallback(() =>
    transactions.filter((tx) => tx.type === 'income'  && thisMonth(tx)).reduce((s, tx) => s + tx.amount, 0), [transactions, thisMonth]);

  const getTotalExpense = useCallback(() =>
    transactions.filter((tx) => tx.type === 'expense' && thisMonth(tx)).reduce((s, tx) => s + tx.amount, 0), [transactions, thisMonth]);

  const getBalance = useCallback(() => getTotalIncome() - getTotalExpense(), [getTotalIncome, getTotalExpense]);

  const getTransactionsByCategory = useCallback(() => {
    const map = {};
    transactions.filter((tx) => tx.type === 'expense' && thisMonth(tx)).forEach((tx) => {
      const cat = tx.category || 'Other';
      if (!map[cat]) map[cat] = { category: cat, total: 0, count: 0 };
      map[cat].total += tx.amount; map[cat].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [transactions, thisMonth]);

  const getWeeklyData = useCallback(() => {
    const weeks = ['Week 1','Week 2','Week 3','Week 4'].map((w) => ({ week: w, expense: 0, income: 0 }));
    transactions.filter(thisMonth).forEach((tx) => {
      const d = new Date(tx.date || tx.createdAt);
      const i = Math.min(Math.floor((d.getDate() - 1) / 7), 3);
      if (tx.type === 'expense') weeks[i].expense += tx.amount;
      if (tx.type === 'income')  weeks[i].income  += tx.amount;
    });
    return weeks;
  }, [transactions, thisMonth]);

  const getSurviveModeLimit = useCallback(() => {
    const today    = new Date();
    const lastDay  = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = lastDay - today.getDate() + 1;
    const left     = Math.max(monthlyBudget - getTotalExpense(), 0);
    return daysLeft > 0 ? Math.floor(left / daysLeft) : 0;
  }, [monthlyBudget, getTotalExpense]);

  // ── Goal Actions ──────────────────────────────────────────────────────────
  const addGoal           = useCallback((g)      => setGoals((prev) => [{ ...g, id: crypto.randomUUID() }, ...prev]), []);
  const deleteGoal        = useCallback((id)     => setGoals((prev) => prev.filter((g) => g.id !== id)), []);
  const updateGoalSavings = useCallback((id, amt) =>
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, saved: Math.min(g.saved + amt, g.target) } : g)), []);

  // ── User Actions ──────────────────────────────────────────────────────────
  const loginUser  = useCallback((u) => setUser(u), []);
  const logoutUser = useCallback(()  => setUser(null), []);

  const value = {
    transactions, user, monthlyBudget, goals,
    setMonthlyBudget, loginUser, logoutUser,
    addTransaction, deleteTransaction, updateTransaction,
    getTotalIncome, getTotalExpense, getBalance,
    getTransactionsByCategory, getWeeklyData, getSurviveModeLimit,
    addGoal, deleteGoal, updateGoalSavings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/** useApp — consume PocketWise global state. Throws if outside <AppProvider>. */
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};

export default AppContext;
