/**
 * AppContext.jsx — PocketWise Global State
 * Provides app-wide state and actions via React Context.
 * Transactions are stored per-user in Firestore.
 * Goals and profile data are also Firestore-backed.
 * Dark mode preference is kept in localStorage (device-local, intentional).
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import {
  collection, addDoc, deleteDoc,
  doc, onSnapshot, query,
  orderBy, setDoc, getDoc, updateDoc,
} from 'firebase/firestore';

const AppContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }) => {
  const { user } = useAuth();

  // ── Core state ──────────────────────────────────────────────────────────────
  const [transactions,     setTransactions]     = useState([]);
  const [userProfile,      setUserProfile]      = useState(null);
  const [monthlyBudget,    setMonthlyBudgetState] = useState(8000);
  const [goals,            setGoals]            = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dark mode: kept in localStorage only (intentionally device-local)
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
  };

  // ── Firestore: real-time transaction listener ───────────────────────────────
  useEffect(() => {
    if (!user) { setTransactions([]); return; }

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [user]);

  // ── Firestore: load user profile (name, college, budget) ───────────────────
  useEffect(() => {
    if (!user) { setUserProfile(null); return; }

    const ref = doc(db, 'users', user.uid);
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile(data);
        if (data.monthlyBudget) setMonthlyBudgetState(data.monthlyBudget);
      }
    });
  }, [user]);

  // ── Firestore: real-time goals listener ────────────────────────────────────
  useEffect(() => {
    if (!user) { setGoals([]); return; }

    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'goals'),
      (snap) => setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return unsub;
  }, [user]);

  // ── Transaction Actions ────────────────────────────────────────────────────
  const addTransaction = useCallback(async (tx) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      ...tx,
      amount:    Math.abs(Number(tx.amount)),
      createdAt: new Date().toISOString(),
    });
  }, [user]);

  const deleteTransaction = useCallback(async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  }, [user]);

  // updateTransaction: local-only optimistic update + Firestore merge
  const updateTransaction = useCallback(async (id, updates) => {
    if (!user) return;
    await setDoc(
      doc(db, 'users', user.uid, 'transactions', id),
      updates,
      { merge: true }
    );
  }, [user]);

  // ── Monthly Budget: save to Firestore user profile ─────────────────────────
  const setMonthlyBudget = useCallback(async (value) => {
    setMonthlyBudgetState(value);
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), { monthlyBudget: value }, { merge: true });
  }, [user]);

  // ── Computed helpers (unchanged) ───────────────────────────────────────────
  const thisMonth = useCallback((tx) => {
    const now = new Date();
    const d   = new Date(tx.date || tx.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }, []);

  const getTotalIncome = useCallback(() =>
    transactions.filter((tx) => tx.type === 'income'  && thisMonth(tx)).reduce((s, tx) => s + tx.amount, 0),
  [transactions, thisMonth]);

  const getTotalExpense = useCallback(() =>
    transactions.filter((tx) => tx.type === 'expense' && thisMonth(tx)).reduce((s, tx) => s + tx.amount, 0),
  [transactions, thisMonth]);

  const getBalance = useCallback(() =>
    getTotalIncome() - getTotalExpense(),
  [getTotalIncome, getTotalExpense]);

  const getTransactionsByCategory = useCallback(() => {
    const map = {};
    transactions.filter((tx) => tx.type === 'expense' && thisMonth(tx)).forEach((tx) => {
      const cat = tx.category || 'Other';
      if (!map[cat]) map[cat] = { category: cat, total: 0, count: 0 };
      map[cat].total += tx.amount;
      map[cat].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [transactions, thisMonth]);

  const getWeeklyData = useCallback(() => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w) => ({ week: w, expense: 0, income: 0 }));
    transactions.filter(thisMonth).forEach((tx) => {
      const d = new Date(tx.date || tx.createdAt);
      const i = Math.min(Math.floor((d.getDate() - 1) / 7), 3);
      if (tx.type === 'expense') weeks[i].expense += tx.amount;
      if (tx.type === 'income')  weeks[i].income  += tx.amount;
    });
    return weeks;
  }, [transactions, thisMonth]);

  const getSurviveModeLimit = useCallback(() => {
    const today   = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = lastDay - today.getDate() + 1;
    const left    = Math.max(monthlyBudget - getTotalExpense(), 0);
    return daysLeft > 0 ? Math.floor(left / daysLeft) : 0;
  }, [monthlyBudget, getTotalExpense]);

  // ── Goal Actions (Firestore-backed) ────────────────────────────────────────
  const addGoal = useCallback(async (g) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'goals'), {
      ...g,
      saved:     g.saved ?? 0,
      createdAt: new Date().toISOString(),
    });
  }, [user]);

  const deleteGoal = useCallback(async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
  }, [user]);

  const updateGoalSavings = useCallback(async (id, amt) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newSaved = Math.min(goal.saved + amt, goal.target);
    await updateDoc(doc(db, 'users', user.uid, 'goals', id), { saved: newSaved });
  }, [user, goals]);

  // ── User profile helpers (for compatibility with existing components) ───────
  // Exposes profile data in the shape the rest of the app already expects.
  const loginUser  = useCallback(() => {}, []); // No-op: auth now handled by AuthContext
  const logoutUser = useCallback(() => {}, []); // No-op: use AuthContext logout instead

  const value = {
    transactions,
    user: userProfile ?? (user ? { displayName: user.displayName, email: user.email } : null),
    monthlyBudget,
    goals,
    isMobileMenuOpen,
    darkMode,
    setMonthlyBudget,
    loginUser,
    logoutUser,
    setIsMobileMenuOpen,
    toggleDarkMode,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    getTransactionsByCategory,
    getWeeklyData,
    getSurviveModeLimit,
    addGoal,
    deleteGoal,
    updateGoalSavings,
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
