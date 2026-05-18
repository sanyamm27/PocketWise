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
import { exportMonthlyReport } from '../utils/exportPDF';

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
  const { transactions, getTotalIncome, getTotalExpense, user } = useApp();
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

  const handleExport = () => {
    const stats = {
      income: filteredIncome,
      expense: filteredExpense,
      balance: filteredIncome - filteredExpense
    };
    exportMonthlyReport(filtered, user, stats);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFF] dark:bg-[#0F1117]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-[240px]">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-4xl w-full mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1D2E] dark:text-white">Transactions</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{transactions.length} total entries</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExport} 
                className="pw-btn-ghost gap-2 text-sm px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-btn transition-colors font-semibold text-gray-500 dark:text-gray-400 hover:text-[#1A1D2E] dark:hover:text-white border border-gray-200 dark:border-gray-700"
              >
                Export PDF 📄
              </button>
              <button onClick={() => setModalOpen(true)} className="pw-btn-primary gap-2 hidden sm:flex">
                <Plus size={16} /> Add Entry
              </button>
            </div>
          </div>

          {/* Monthly Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#F0FFF9] rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium mb-1">Income</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(filteredIncome)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </div>
            </div>
            <div className="bg-[#FFF5F5] rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700 font-medium mb-1">Expense</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(filteredExpense)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search transactions..."
              value={search} onChange={(e) => setSearch(e.target.value)} 
              className="w-full bg-white dark:bg-[#1A1D2E] border border-gray-200 dark:border-gray-700 text-[#1A1D2E] dark:text-white text-sm rounded-2xl pl-11 pr-4 py-3.5 outline-none transition-all duration-200 shadow-sm focus:border-[#4A90E2] focus:shadow-md focus:shadow-blue-100" />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveChip(f)}
                className={`px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeChip === f ? 'bg-[#4A90E2] text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Grouped List */}
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeInUp">
              <div className="text-[80px] leading-none mb-6">🪙</div>
              <h3 className="text-xl font-semibold text-[#1A1D2E] mb-2">No transactions yet</h3>
              <p className="text-sm text-gray-500 mb-6">Start logging to see your history</p>
              <button onClick={() => setModalOpen(true)} className="bg-[#4A90E2] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <Plus size={18} /> Add First Entry
              </button>
            </div>
          ) : (
            <div className="space-y-6 pb-20">
              {grouped.map(({ label, items }) => (
                <div key={label}>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
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
