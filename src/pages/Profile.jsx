/**
 * Profile.jsx — PocketWise
 * User profile, stats, settings, budget edit, export, and logout.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit2, Check, X, Download, LogOut,
  Bell, AlertTriangle, Moon, Wallet, Trophy, CalendarDays, Hash,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ enabled, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${enabled ? 'bg-primary' : 'bg-gray-200'}`}
    aria-pressed={enabled}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                      transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex-1 bg-white rounded-card shadow-card px-4 py-4 flex flex-col items-center gap-2 min-w-0">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
      <Icon size={16} className="text-white" />
    </div>
    <p className="text-lg font-bold text-textPrimary">{value}</p>
    <p className="text-xs text-textSecondary text-center leading-tight">{label}</p>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const Profile = () => {
  const { user, loginUser, logoutUser, transactions, monthlyBudget, setMonthlyBudget } = useApp();
  const navigate = useNavigate();

  // ── Editable profile ──────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(user?.displayName ?? '');
  const [collegeVal, setCollegeVal] = useState(user?.college ?? '');

  const saveProfile = () => {
    loginUser({ ...user, displayName: nameVal.trim() || 'Student', college: collegeVal.trim() });
    setEditing(false);
  };
  const cancelEdit = () => {
    setNameVal(user?.displayName ?? '');
    setCollegeVal(user?.college ?? '');
    setEditing(false);
  };

  // ── Budget editing ────────────────────────────────────────────────────────
  const [editBudget, setEditBudget] = useState(false);
  const [budgetVal,  setBudgetVal]  = useState(String(monthlyBudget));

  const saveBudget = () => {
    const v = Number(budgetVal);
    if (v > 0) setMonthlyBudget(v);
    setEditBudget(false);
  };

  // ── Settings toggles ──────────────────────────────────────────────────────
  const [reminders,      setReminders]      = useState(false);
  const [overspendAlert, setOverspendAlert] = useState(true);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const memberSince = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'May 2024';

  const streakCount = (() => {
    const days = new Set(transactions.map((tx) => new Date(tx.date || tx.createdAt).toDateString()));
    let count = 0; const d = new Date();
    while (days.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
    return count;
  })();

  // ── Export data ───────────────────────────────────────────────────────────
  const handleExport = () => {
    const data = { user, transactions, monthlyBudget, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'pocketwise_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => { logoutUser(); navigate('/'); };

  const initials = (user?.displayName ?? 'PW').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex min-h-screen bg-[#F8FAFF] dark:bg-[#0F1117]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-[240px]">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-2xl w-full mx-auto space-y-6">

          <h1 className="text-2xl font-bold text-[#1A1D2E] dark:text-white">Profile & Settings</h1>

          {/* ── Avatar + Name Card ───────────────────────────────────────── */}
          <div className="pw-card flex flex-col items-center gap-4 text-center relative dark:bg-[#1A1D2E]">
            {/* Edit toggle */}
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="absolute top-4 right-4 p-2 rounded-btn text-textSecondary hover:bg-gray-100 transition-colors"
                aria-label="Edit profile">
                <Edit2 size={16} />
              </button>
            ) : (
              <div className="absolute top-4 right-4 flex gap-1">
                <button onClick={saveProfile} className="p-2 rounded-btn text-success hover:bg-green-50 transition-colors"><Check size={16} /></button>
                <button onClick={cancelEdit}  className="p-2 rounded-btn text-danger  hover:bg-red-50   transition-colors"><X    size={16} /></button>
              </div>
            )}

            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent
                            flex items-center justify-center text-white text-2xl font-bold shadow-card">
              {initials}
            </div>

            {/* Name + College */}
            {editing ? (
              <div className="w-full space-y-2">
                <input value={nameVal} onChange={(e) => setNameVal(e.target.value)}
                  className="pw-input text-center font-semibold" placeholder="Your name" />
                <input value={collegeVal} onChange={(e) => setCollegeVal(e.target.value)}
                  className="pw-input text-center text-sm" placeholder="Your college" />
              </div>
            ) : (
              <div>
                <p className="text-xl font-bold text-textPrimary">{user?.displayName ?? 'Student'}</p>
                <p className="text-sm text-textSecondary mt-0.5">{user?.college ?? 'PocketWise User'}</p>
              </div>
            )}
          </div>

          {/* ── Stats Row ─────────────────────────────────────────────────── */}
          <div className="flex gap-3">
            <StatCard icon={CalendarDays} label="Member Since" value={memberSince}      color="bg-primary"  />
            <StatCard icon={Hash}         label="Total Entries" value={transactions.length} color="bg-accent" />
            <StatCard icon={Trophy}       label="Longest Streak" value={`${streakCount}d`} color="bg-success" />
          </div>

          {/* ── Monthly Budget ───────────────────────────────────────────── */}
          <div className="pw-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-primary" />
                <h2 className="text-sm font-bold text-textPrimary">Monthly Budget</h2>
              </div>
              {!editBudget ? (
                <button onClick={() => setEditBudget(true)} className="pw-btn-ghost gap-1.5 text-xs">
                  <Edit2 size={13} /> Edit
                </button>
              ) : (
                <div className="flex gap-1">
                  <button onClick={saveBudget} className="p-1.5 rounded-btn text-success hover:bg-green-50"><Check size={15} /></button>
                  <button onClick={() => setEditBudget(false)} className="p-1.5 rounded-btn text-danger hover:bg-red-50"><X size={15} /></button>
                </div>
              )}
            </div>
            {editBudget ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-textSecondary">₹</span>
                <input type="number" value={budgetVal} onChange={(e) => setBudgetVal(e.target.value)}
                  className="pw-input text-2xl font-bold" min="500" max="100000" />
              </div>
            ) : (
              <p className="text-3xl font-bold text-primary">
                ₹{monthlyBudget.toLocaleString('en-IN')}
                <span className="text-sm text-textSecondary font-normal ml-2">/ month</span>
              </p>
            )}
          </div>

          {/* ── Settings Toggles ─────────────────────────────────────────── */}
          <div className="pw-card space-y-0 divide-y divide-gray-50">
            <h2 className="text-sm font-bold text-textPrimary pb-3">Preferences</h2>

            {/* Daily reminders */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-semibold text-textPrimary">Daily Reminder</p>
                  <p className="text-xs text-textSecondary">Remind me to log my expenses daily</p>
                </div>
              </div>
              <Toggle enabled={reminders} onChange={setReminders} />
            </div>

            {/* Overspend alerts */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-danger" />
                <div>
                  <p className="text-sm font-semibold text-textPrimary">Overspend Alerts</p>
                  <p className="text-xs text-textSecondary">Warn me when I approach budget limits</p>
                </div>
              </div>
              <Toggle enabled={overspendAlert} onChange={setOverspendAlert} />
            </div>

            {/* Dark mode — coming soon */}
            <div className="flex items-center justify-between py-4 opacity-60">
              <div className="flex items-center gap-3">
                <Moon size={18} className="text-textSecondary" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-textPrimary">Dark Mode</p>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-chip bg-gray-100 text-textSecondary uppercase tracking-wide">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary">Switch to a dark theme</p>
                </div>
              </div>
              <Toggle enabled={false} onChange={() => {}} disabled />
            </div>
          </div>

          {/* ── Export + Logout ───────────────────────────────────────────── */}
          <div className="space-y-3">
            <button onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-btn
                         border-2 border-primary text-primary font-semibold text-sm
                         hover:bg-blue-50 active:scale-[0.98] transition-all">
              <Download size={16} /> Export My Data (.json)
            </button>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-btn
                         bg-red-50 border-2 border-red-100 text-danger font-semibold text-sm
                         hover:bg-red-100 active:scale-[0.98] transition-all">
              <LogOut size={16} /> Log Out
            </button>
          </div>

          <p className="text-center text-xs text-textSecondary pb-4">
            PocketWise v1.0.0 — Made for students 💙
          </p>
        </main>
      </div>
    </div>
  );
};

export default Profile;
