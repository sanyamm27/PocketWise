/**
 * Transactions.jsx — PocketWise
 * Full transaction history: search, filter chips, monthly summary, grouped list.
 */

import { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TransactionCard from '../components/TransactionCard';
import AddTransactionModal from '../components/AddTransactionModal';
import { useApp } from '../context/AppContext';
import { groupTransactionsByDate, formatCurrency } from '../utils/helpers';

const FILTERS = ['All', 'Income', 'Expense', 'This Week', 'This Month'];

const isThisWeek = (dateStr) => {
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
};

const isThisMonth = (dateStr) => {
  const d = new Date(dateStr); const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const Transactions = () => {
  const { transactions, getTotalIncome, getTotalExpense } = useApp();
  const [modalOpen,  setModalOpen]  = useState(false);
  const [search,     setSearch]     = useState('');
  const [activeChip, setActiveChip] = useState('All');

  const filtered = useMemo(() => transactions.filter((tx) => {
    const d      = tx.date || tx.createdAt;
    const q      = search.toLowerCase();
    const matchQ = !search || tx.name?.toLowerCase().includes(q) || tx.category?.toLowerCase().includes(q);
    let   matchF = true;
    if (activeChip === 'Income')     matchF = tx.type === 'income';
    if (activeChip === 'Expense')    matchF = tx.type === 'expense';
    if (activeChip === 'This Week')  matchF = isThisWeek(d);
    if (activeChip === 'This Month') matchF = isThisMonth(d);
    return matchQ && matchF;
  }), [transactions, search, activeChip]);

  const grouped = groupTransactionsByDate(filtered);

  // Summary for filtered set
  const filteredIncome  = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const filteredExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-4xl w-full mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary">Transactions</h1>
              <p className="text-sm text-textSecondary mt-0.5">{transactions.length} total entries</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="pw-btn-primary gap-2 hidden sm:flex">
              <Plus size={16} /> Add Entry
            </button>
          </div>

          {/* Monthly Summary Bar */}
          <div className="bg-white rounded-card shadow-card px-5 py-4 flex items-center justify-around gap-4">
            <div className="text-center">
              <p className="text-xs text-textSecondary mb-1">Total In</p>
              <p className="text-lg font-bold text-success">{formatCurrency(filteredIncome)}</p>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="text-center">
              <p className="text-xs text-textSecondary mb-1">Total Out</p>
              <p className="text-lg font-bold text-danger">{formatCurrency(filteredExpense)}</p>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="text-center">
              <p className="text-xs text-textSecondary mb-1">Net</p>
              <p className={`text-lg font-bold ${filteredIncome - filteredExpense >= 0 ? 'text-primary' : 'text-danger'}`}>
                {formatCurrency(filteredIncome - filteredExpense)}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
            <input type="text" placeholder="Search by name or category..."
              value={search} onChange={(e) => setSearch(e.target.value)} className="pw-input pl-9" />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveChip(f)}
                className={`px-4 py-2 text-xs font-semibold rounded-chip whitespace-nowrap border transition-all ${
                  activeChip === f ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-textSecondary border-gray-200 hover:border-primary hover:text-primary'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Grouped List */}
          {grouped.length === 0 ? (
            <div className="text-center py-20 text-textSecondary animate-fade-in">
              <div className="text-6xl mb-4">👛</div>
              <p className="text-base font-semibold text-textPrimary">No transactions yet</p>
              <p className="text-sm mt-1">Start logging to see your entries here!</p>
              <button onClick={() => setModalOpen(true)} className="pw-btn-primary mt-5 mx-auto">
                <Plus size={15} /> Add First Entry
              </button>
            </div>
          ) : (
            <div className="space-y-6 pb-20">
              {grouped.map(({ label, items }) => (
                <div key={label}>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs font-bold text-textSecondary uppercase tracking-wider">{label}</p>
                    <div className="flex-1 h-px bg-gray-100" />
                    <p className="text-xs text-textSecondary">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="space-y-2">
                    {items.map((tx) => <TransactionCard key={tx.id} {...tx} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <button onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-modal flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all z-40"
        aria-label="Add transaction"><Plus size={26} /></button>
      <AddTransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Transactions;
