/**
 * WeeklyReport.jsx — PocketWise
 * Compares last 7 days vs previous 7 days spending and assigns a grade.
 */

import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

const WeeklyReport = () => {
  const { transactions } = useApp();

  const nowTime = new Date().getTime();
  const ONE_DAY = 1000 * 60 * 60 * 24;

  let thisWeekSpend = 0;
  let lastWeekSpend = 0;
  const thisWeekCats = {};

  // Calculate spending for "this week" (0-6 days ago) and "last week" (7-13 days ago)
  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const txTime = new Date(tx.date || tx.createdAt).getTime();
      const daysDiff = (nowTime - txTime) / ONE_DAY;

      if (daysDiff >= 0 && daysDiff < 7) {
        thisWeekSpend += tx.amount;
        thisWeekCats[tx.category] = (thisWeekCats[tx.category] || 0) + tx.amount;
      } else if (daysDiff >= 7 && daysDiff < 14) {
        lastWeekSpend += tx.amount;
      }
    });

  // Calculate percentage change
  let percentChange = 0;
  if (lastWeekSpend > 0) {
    percentChange = Math.round(((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100);
  } else if (thisWeekSpend > 0) {
    percentChange = 100;
  }

  // Determine Grade, Colors, and Text
  let grade = 'B';
  let gradeClass = 'bg-[#4A90E2]'; // Primary blue
  let tip = 'Steady spending! Consistent as always.';
  let trendIcon = '➖';
  let trendText = 'about the same as last week';

  if (percentChange <= -5 || (lastWeekSpend > 0 && thisWeekSpend === 0)) {
    grade = 'A';
    gradeClass = 'bg-[#3ECF8E]'; // Success green
    tip = 'Great job! You saved money this week.';
    trendIcon = '📉';
    trendText = `${Math.abs(percentChange)}% less than last week`;
  } else if (percentChange >= 5) {
    grade = 'C';
    gradeClass = 'bg-orange-500'; // Orange
    tip = 'A bit heavy this week. Time to tighten the belt!';
    trendIcon = '📈';
    trendText = `${percentChange}% more than last week`;
  } else if (thisWeekSpend === 0 && lastWeekSpend === 0) {
    grade = 'A';
    gradeClass = 'bg-[#3ECF8E]';
    tip = 'Perfect! No spending at all recently.';
    trendIcon = '🌟';
    trendText = 'no spending to compare';
  }

  // Find lowest spend category for this week
  const sortedCats = Object.entries(thisWeekCats).sort((a, b) => a[1] - b[1]);
  const bestCategory = sortedCats.length > 0 ? sortedCats[0][0] : 'None';

  return (
    <div className="pw-card">
      <h2 className="pw-section-title mb-5">Weekly Report Card 📊</h2>
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Grade Badge */}
        <div className="relative shrink-0 mt-1">
          <div className={`absolute inset-0 rounded-full blur-md opacity-60 ${gradeClass}`}></div>
          <div 
            className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-md ${gradeClass}`}
          >
            {grade}
          </div>
        </div>
        
        {/* Stats & Tips */}
        <div className="flex-1 min-w-0 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-textSecondary">This Week's Spend</p>
              <p className="text-2xl font-bold text-textPrimary truncate mt-0.5">
                {formatCurrency(thisWeekSpend)}
              </p>
              <p className="text-sm text-textSecondary mt-1 font-medium">
                {trendText} {trendIcon}
              </p>
            </div>
            
            <div className="flex flex-col justify-center space-y-3">
              <div className="bg-[#F8FAFF] border border-blue-100/50 px-4 py-2.5 rounded-xl">
                <p className="text-sm font-semibold text-[#1A1D2E] leading-snug">
                  💡 {tip}
                </p>
              </div>
              {bestCategory !== 'None' && (
                <p className="text-xs text-textSecondary px-1 font-medium">
                  🏆 Best category: <strong className="text-textPrimary">{bestCategory}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
