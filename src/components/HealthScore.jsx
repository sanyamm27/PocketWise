/**
 * HealthScore.jsx — PocketWise
 * Calculates and displays a user's financial health score out of 100.
 */

import { useApp } from '../context/AppContext';

const HealthScore = () => {
  const { getTotalIncome, getTotalExpense, monthlyBudget, transactions, goals } = useApp();

  const income = getTotalIncome();
  const expense = getTotalExpense();

  // 1. Savings rate (40pts)
  // Target: 40% savings gives full 40 pts
  let savingsScore = 0;
  if (income > 0) {
    const savingsRate = (income - expense) / income;
    savingsScore = Math.max(0, Math.min(40, savingsRate * 100));
  } else {
    // If no income recorded yet, give half points if under budget
    savingsScore = expense <= monthlyBudget ? 20 : 0;
  }

  // 2. Budget adherence (30pts)
  // Target: Under budget = 30 pts. Over budget penalizes score.
  let budgetScore = 0;
  if (expense <= monthlyBudget) {
    budgetScore = 30;
  } else {
    const overPct = (expense - monthlyBudget) / monthlyBudget;
    budgetScore = Math.max(0, 30 - (overPct * 100));
  }

  // 3. Logging Streak (20pts)
  // Target: 7 day streak gives full 20 pts
  const streakCount = (() => {
    const days = new Set(transactions.map((tx) => new Date(tx.date || tx.createdAt).toDateString()));
    let count = 0;
    const d = new Date();
    while (days.has(d.toDateString())) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();
  const streakScore = Math.min(20, (streakCount / 7) * 20);

  // 4. Goals progress (10pts)
  // Target: Percentage of total goals saved
  let goalsScore = 0;
  if (goals && goals.length > 0) {
    const totalTarget = goals.reduce((s, g) => s + g.target, 0);
    const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
    goalsScore = totalTarget > 0 ? (totalSaved / totalTarget) * 10 : 10;
  } else {
    goalsScore = 10; // Free points if no goals set
  }

  const score = Math.round(savingsScore + budgetScore + streakScore + goalsScore);

  // Determine colors and labels
  let colorClass = 'text-danger';
  let strokeClass = 'stroke-danger';
  let label = 'Needs Work ⚠️';

  if (score >= 70) {
    colorClass = 'text-success';
    strokeClass = 'stroke-[#3ECF8E]'; // success color
    label = 'Great Saver 🌟';
  } else if (score >= 40) {
    colorClass = 'text-orange-500';
    strokeClass = 'stroke-orange-500';
    label = 'Doing OK 📈';
  }

  // SVG parameters
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center justify-center text-center">
      <h2 className="pw-section-title mb-4 w-full text-left">Financial Health</h2>
      
      <div className="relative flex items-center justify-center my-2">
        {/* SVG Ring */}
        <svg className={`w-36 h-36 transform -rotate-90 drop-shadow-[0_0_8px_currentColor] ${colorClass}`}>
          {/* Background Ring */}
          <circle
            cx="72" cy="72" r={radius}
            stroke="#EEF2FF" strokeWidth="12" fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx="72" cy="72" r={radius}
            stroke="currentColor" strokeWidth="12" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${colorClass}`}>{score}</span>
          <span className="text-xs uppercase font-bold text-textSecondary tracking-widest mt-1">Score</span>
        </div>
      </div>

      <p className={`mt-4 text-lg font-semibold ${colorClass}`}>{label}</p>
      <p className="text-xs text-textSecondary mt-1 px-4">
        Based on savings rate, budget adherence, goals, and logging streak.
      </p>
    </div>
  );
};

export default HealthScore;
