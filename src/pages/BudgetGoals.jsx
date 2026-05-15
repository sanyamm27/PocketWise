/**
 * BudgetGoals.jsx — PocketWise
 * Budget tracker + savings goals with GoalRing and BudgetProgressBar.
 */

import { useState } from 'react';
import { Plus, Target, Lightbulb, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BudgetProgressBar from '../components/BudgetProgressBar';
import GoalRing from '../components/GoalRing';
import { useApp } from '../context/AppContext';
import { formatCurrency, getCategoryEmoji } from '../utils/helpers';

const CATEGORIES = ['Food','Transport','Study','Fun','Pocket Money','Recharge','Shopping','Other'];

const BudgetGoals = () => {
  const { getTransactionsByCategory, monthlyBudget, goals, addGoal, deleteGoal } = useApp();
  const cats = getTransactionsByCategory();

  // ── Budget limit per category (simple: budget / 8 as default split) ──────
  const defaultPerCat = Math.floor(monthlyBudget / CATEGORIES.length);

  // ── Add Goal form state ───────────────────────────────────────────────────
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm,     setGoalForm]     = useState({ name: '', target: '', emoji: '🎯', deadline: '' });
  const [goalError,    setGoalError]    = useState('');

  const setGF = (k, v) => setGoalForm((p) => ({ ...p, [k]: v }));

  const handleAddGoal = () => {
    if (!goalForm.name.trim()) { setGoalError('Enter a goal name.'); return; }
    if (!goalForm.target || Number(goalForm.target) <= 0) { setGoalError('Enter a valid target amount.'); return; }
    addGoal({ name: goalForm.name.trim(), target: Number(goalForm.target), saved: 0, emoji: goalForm.emoji, deadline: goalForm.deadline });
    setGoalForm({ name: '', target: '', emoji: '🎯', deadline: '' });
    setShowGoalForm(false);
    setGoalError('');
  };

  const GOAL_EMOJIS = ['🎯','💻','✈️','🏠','📱','🎓','🚗','💎','🎸','👟'];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-5xl w-full mx-auto space-y-8">

          <h1 className="text-2xl font-bold text-textPrimary">Budget & Goals</h1>

          {/* ── My Budgets ───────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="pw-section-title">My Budgets</h2>
                <p className="pw-section-subtitle">Monthly limit: {formatCurrency(monthlyBudget)}</p>
              </div>
            </div>

            <div className="pw-card space-y-1 divide-y divide-gray-50">
              {CATEGORIES.map((cat) => {
                const spent = cats.find((c) => c.category === cat)?.total ?? 0;
                return (
                  <BudgetProgressBar
                    key={cat}
                    category={cat}
                    emoji={getCategoryEmoji(cat)}
                    spent={spent}
                    total={defaultPerCat}
                  />
                );
              })}
            </div>

            <p className="text-xs text-textSecondary mt-3 text-center">
              Budget split evenly across {CATEGORIES.length} categories · {formatCurrency(defaultPerCat)} each
            </p>
          </section>

          {/* ── My Savings Goals ─────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="pw-section-title">My Savings Goals</h2>
                <p className="pw-section-subtitle">{goals.length} active goal{goals.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setShowGoalForm((v) => !v)} className="pw-btn-primary gap-2">
                <Plus size={15} /> Add Goal
              </button>
            </div>

            {/* Add Goal Form */}
            {showGoalForm && (
              <div className="bg-white rounded-card shadow-card p-5 mb-5 animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-textPrimary">New Savings Goal</h3>
                  <button onClick={() => setShowGoalForm(false)} className="text-textSecondary hover:text-danger transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Emoji picker */}
                <div>
                  <label className="pw-label">Icon</label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {GOAL_EMOJIS.map((e) => (
                      <button key={e} onClick={() => setGF('emoji', e)}
                        className={`w-9 h-9 rounded-btn text-lg transition-all border ${goalForm.emoji === e ? 'border-primary bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="pw-label">Goal Name</label>
                    <input type="text" placeholder="e.g. New Laptop" value={goalForm.name}
                      onChange={(e) => setGF('name', e.target.value)} className="pw-input mt-1" />
                  </div>
                  <div>
                    <label className="pw-label">Target Amount (₹)</label>
                    <input type="number" placeholder="e.g. 45000" value={goalForm.target}
                      onChange={(e) => setGF('target', e.target.value)} className="pw-input mt-1" min="1" />
                  </div>
                </div>

                <div>
                  <label className="pw-label">Deadline (optional)</label>
                  <input type="date" value={goalForm.deadline}
                    onChange={(e) => setGF('deadline', e.target.value)} className="pw-input mt-1" />
                </div>

                {goalError && <p className="text-xs text-danger">{goalError}</p>}

                <button onClick={handleAddGoal} className="pw-btn-primary w-full py-3">
                  Save Goal
                </button>
              </div>
            )}

            {/* Goal Cards Grid */}
            {goals.length === 0 ? (
              <div className="text-center py-12 text-textSecondary bg-white rounded-card shadow-card">
                <p className="text-4xl mb-2">🎯</p>
                <p className="text-sm font-medium text-textPrimary">No goals yet</p>
                <p className="text-xs mt-1">Add a savings goal to start tracking your progress.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-white rounded-card shadow-card relative group">
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-btn text-textSecondary
                                 hover:bg-red-50 hover:text-danger opacity-0 group-hover:opacity-100 transition-all z-10"
                      aria-label={`Delete goal: ${goal.name}`}
                    >
                      <X size={13} />
                    </button>
                    <GoalRing goalName={goal.name} saved={goal.saved} target={goal.target} emoji={goal.emoji} />
                    {goal.deadline && (
                      <p className="text-center text-[10px] text-textSecondary pb-3 -mt-2">
                        Due {new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── PocketWise Tip ────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-card px-5 py-4 flex gap-3 items-start">
            <Lightbulb size={20} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-textPrimary">PocketWise Tip</p>
              <p className="text-sm text-textSecondary mt-0.5">
                Saving just ₹50/day = <strong className="text-primary">₹1,500 this month</strong>. Small habits build big futures! 💡
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BudgetGoals;
