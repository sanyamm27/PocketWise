/**
 * SurviveMode.jsx — PocketWise
 * Daily spending limit calculator for end-of-month budget survival.
 */

import { useState } from 'react';
import { Zap, Calendar, TrendingDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import { formatCurrency, getDaysLeftInMonth, calculateDailyLimit, getCategoryEmoji } from '../utils/helpers';

// Smart tips based on top spending category
const getTips = (topCategory) => {
  const tips = {
    Food: [
      '🍱 Cook meals at home — saves ₹150-300/day vs eating out.',
      '☕ Skip the café coffee. Make it yourself and save ₹80/day.',
      '🛒 Meal-prep on Sundays to avoid impulsive food orders.',
    ],
    Fun: [
      '🎮 Set a weekend-only entertainment rule.',
      '📺 Share OTT subscriptions with friends to halve the cost.',
      '🎬 Attend free campus events instead of paid outings.',
    ],
    Transport: [
      '🚌 Use public transport — saves ₹100-200 per day vs cabs.',
      '🚲 Walk or cycle for distances under 2 km.',
      '🤝 Carpool with college friends for shared rides.',
    ],
    Shopping: [
      '🛍️ Add items to cart and wait 24h before buying.',
      '🏷️ Check Meesho/AJIO sale seasons before full-price buys.',
      '📦 Unsubscribe from marketing emails to reduce impulse buys.',
    ],
    default: [
      '📋 Write tomorrow\'s spending plan tonight before you sleep.',
      '💵 Use cash for the day — it\'s harder to overspend vs UPI.',
      '🎯 Set a no-spend challenge for one weekday per week.',
    ],
  };
  return tips[topCategory] ?? tips.default;
};

const SurviveMode = () => {
  const { transactions, getTotalExpense, monthlyBudget, getTransactionsByCategory } = useApp();
  const [cashOnHand, setCashOnHand] = useState('');

  const daysLeft    = getDaysLeftInMonth();
  const totalDays   = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysPassed  = totalDays - daysLeft;
  const progressPct = Math.round((daysPassed / totalDays) * 100);

  // Use cash on hand if entered, else use budget balance
  const availableBalance = cashOnHand !== '' && !isNaN(Number(cashOnHand))
    ? Math.max(Number(cashOnHand), 0)
    : Math.max(monthlyBudget - getTotalExpense(), 0);

  const dailyLimit  = calculateDailyLimit(availableBalance, daysLeft);
  const weeklyLimit = dailyLimit * 7;

  // Top spending category for tips
  const topCat = getTransactionsByCategory()[0]?.category ?? 'default';
  const tips   = getTips(topCat);

  const limitColor = dailyLimit > 300 ? 'text-success' : dailyLimit > 100 ? 'text-primary' : 'text-danger';

  return (
    <div className="flex min-h-screen bg-[#F8FAFF] dark:bg-[#0F1117]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-[240px]">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-2xl w-full mx-auto space-y-6">

          {/* Header */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-danger flex items-center justify-center mx-auto mb-4 shadow-card">
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1D2E] dark:text-white">Survive Till Month End 💪</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter your available cash and we'll calculate your safe daily limit.
            </p>
          </div>

          {/* Cash Input */}
          <div className="pw-card">
            <label className="pw-label">How much cash do you have right now?</label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-textSecondary">₹</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="e.g. 2500"
                value={cashOnHand}
                onChange={(e) => setCashOnHand(e.target.value)}
                className="pw-input text-2xl font-bold flex-1"
                min="0"
                aria-label="Cash on hand"
              />
            </div>
            {cashOnHand === '' && (
              <p className="text-xs text-textSecondary mt-2">
                💡 Leave blank to auto-calculate from your budget balance ({formatCurrency(availableBalance)} remaining)
              </p>
            )}
          </div>

          {/* Days Progress Bar */}
          <div className="pw-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-textSecondary">
                <Calendar size={16} />
                <span>{daysPassed} days passed</span>
              </div>
              <span className="text-sm font-semibold text-textPrimary">{daysLeft} days left</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-textSecondary text-center">{progressPct}% of the month gone</p>
          </div>

          {/* Daily Limit Card */}
          <div className="bg-gradient-to-br from-primary to-accent rounded-card p-8 text-white text-center shadow-card-hover">
            <p className="text-sm font-medium opacity-80 mb-2">Your Safe Daily Limit</p>
            <p className={`text-6xl font-bold tracking-tight mb-1`}>
              {formatCurrency(dailyLimit)}
            </p>
            <p className="text-sm opacity-75">per day</p>

            <div className="mt-6 pt-5 border-t border-white/20 flex justify-around">
              <div>
                <p className="text-xs opacity-70">Weekly Limit</p>
                <p className="text-xl font-bold mt-0.5">{formatCurrency(weeklyLimit)}</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-xs opacity-70">Days Remaining</p>
                <p className="text-xl font-bold mt-0.5">{daysLeft}</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-xs opacity-70">Available</p>
                <p className="text-xl font-bold mt-0.5">{formatCurrency(availableBalance)}</p>
              </div>
            </div>
          </div>

          {/* Warning if very tight */}
          {dailyLimit < 100 && (
            <div className="bg-red-50 border border-red-100 rounded-btn px-4 py-3 flex items-center gap-3">
              <TrendingDown size={18} className="text-danger shrink-0" />
              <p className="text-sm text-danger font-medium">
                Your daily limit is very tight. Consider reaching out to family or reducing all non-essential spends.
              </p>
            </div>
          )}

          {/* Smart Tips */}
          <div className="pw-card space-y-4">
            <div>
              <h2 className="pw-section-title">Smart Tips for You 💡</h2>
              <p className="pw-section-subtitle">
                Based on your top spend: {getCategoryEmoji(topCat)} {topCat}
              </p>
            </div>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-btn">
                  <span className="text-primary font-bold text-sm shrink-0 mt-0.5">#{i + 1}</span>
                  <p className="text-sm text-textPrimary">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Footer */}
          <div className="text-center py-4">
            <p className="text-base font-semibold text-textPrimary">You got this! 🙌</p>
            <p className="text-sm text-textSecondary mt-1">PocketWise believes in you.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SurviveMode;
