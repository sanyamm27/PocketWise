/**
 * AddTransactionModal.jsx — PocketWise
 * Centered modal for adding income or expense entries.
 *
 * Props:
 *   isOpen  {boolean}  — controls visibility
 *   onClose {function} — called when user dismisses the modal
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── Category options ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Food',         emoji: '🍔' },
  { label: 'Transport',    emoji: '🚌' },
  { label: 'Study',        emoji: '📚' },
  { label: 'Fun',          emoji: '🎮' },
  { label: 'Pocket Money', emoji: '💰' },
  { label: 'Internship',   emoji: '💼' },
  { label: 'Recharge',     emoji: '📱' },
  { label: 'Other',        emoji: '📦' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayISO = () => new Date().toISOString().split('T')[0];

const INITIAL_FORM = {
  type:     'expense',
  amount:   '',
  category: 'Food',
  date:     todayISO(),
  note:     '',
};

// ─── Component ────────────────────────────────────────────────────────────────
const AddTransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction } = useApp();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) { setForm(INITIAL_FORM); setError(''); }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Field updates ──────────────────────────────────────────────────────────
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const parsed = parseFloat(form.amount);
    if (!form.amount || isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }
    addTransaction({
      type:     form.type,
      amount:   parsed,
      category: form.category,
      date:     form.date,
      note:     form.note.trim(),
      name:     form.note.trim() || form.category,
    });
    onClose();
  };

  const isIncome = form.type === 'income';

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Add transaction"
    >
      {/* ── Modal Card ──────────────────────────────────────────────────── */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-textPrimary">Add Entry</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-btn text-textSecondary hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ── Type Toggle ──────────────────────────────────────────────── */}
          <div className="flex rounded-btn overflow-hidden border border-gray-200 p-1 gap-1 bg-gray-50">
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                onClick={() => set('type', t)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 capitalize ${
                  form.type === t
                    ? t === 'income'
                      ? 'bg-success text-white shadow-sm'
                      : 'bg-danger text-white shadow-sm'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                {t === 'income' ? '+ Income' : '− Expense'}
              </button>
            ))}
          </div>

          {/* ── Amount Input ─────────────────────────────────────────────── */}
          <div className="text-center">
            <label className="pw-label text-center block">Amount</label>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className={`text-3xl font-bold ${isIncome ? 'text-success' : 'text-danger'}`}>
                ₹
              </span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.amount}
                onChange={(e) => { set('amount', e.target.value); setError(''); }}
                className={`text-4xl font-bold w-48 text-center bg-transparent border-none
                            outline-none placeholder:text-gray-200
                            ${isIncome ? 'text-success' : 'text-danger'}`}
                min="0"
                aria-label="Transaction amount"
              />
            </div>
            {error && <p className="text-xs text-danger mt-1">{error}</p>}
          </div>

          {/* ── Category Picker ──────────────────────────────────────────── */}
          <div>
            <label className="pw-label">Category</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {CATEGORIES.map(({ label, emoji }) => (
                <button
                  key={label}
                  onClick={() => set('category', label)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-btn
                              text-xs font-medium border transition-all duration-150 ${
                    form.category === label
                      ? 'border-primary bg-blue-50 text-primary'
                      : 'border-gray-100 bg-gray-50 text-textSecondary hover:border-gray-200 hover:bg-gray-100'
                  }`}
                  aria-pressed={form.category === label}
                >
                  <span className="text-xl leading-none">{emoji}</span>
                  <span className="leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Date + Note ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pw-label">Date</label>
              <input
                type="date"
                value={form.date}
                max={todayISO()}
                onChange={(e) => set('date', e.target.value)}
                className="pw-input mt-1"
                aria-label="Transaction date"
              />
            </div>
            <div>
              <label className="pw-label">Note</label>
              <input
                type="text"
                placeholder="Add a note..."
                value={form.note}
                onChange={(e) => set('note', e.target.value)}
                className="pw-input mt-1"
                maxLength={60}
                aria-label="Transaction note"
              />
            </div>
          </div>
        </div>

        {/* ── Save Button ───────────────────────────────────────────────── */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-btn bg-primary text-white font-bold
                       text-sm shadow-sm hover:bg-blue-600 active:scale-[0.98]
                       transition-all duration-150"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
