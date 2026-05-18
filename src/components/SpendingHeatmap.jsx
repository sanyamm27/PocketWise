/**
 * SpendingHeatmap.jsx — PocketWise
 * GitHub-style 30-day activity grid based on daily expense volume.
 */

import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

const SpendingHeatmap = () => {
  const { transactions } = useApp();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString('en-IN', { month: 'short' });
  const fullMonthName = now.toLocaleDateString('en-IN', { month: 'long' });

  // Calculate daily spend for the current month
  const dailySpend = {};
  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const d = new Date(tx.date || tx.createdAt);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        dailySpend[day] = (dailySpend[day] || 0) + tx.amount;
      }
    });

  // Generate 30 cells (6 cols x 5 rows)
  const cells = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const spent = dailySpend[day] || 0;

    let color = 'bg-[#EEF2FF]'; // No spend
    if (spent > 0 && spent < 200) {
      color = 'bg-[#93C5FD]';
    } else if (spent >= 200 && spent < 500) {
      color = 'bg-[#4A90E2]';
    } else if (spent >= 500) {
      color = 'bg-[#1E40AF]';
    }

    return { day, spent, color };
  });

  return (
    <div className="pw-card">
      <h2 className="pw-section-title mb-1">
        Spending Heatmap — {fullMonthName} {year}
      </h2>
      <p className="pw-section-subtitle mb-6">Daily expense intensity over 30 days</p>

      {/* Grid: 6 cols x 5 rows */}
      <div className="grid grid-cols-6 gap-2 sm:gap-3 max-w-fit mx-auto">
        {cells.map(({ day, spent, color }) => (
          <div
            key={day}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${color} relative group cursor-pointer transition-transform duration-200 hover:scale-110 shadow-sm`}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-lg z-10 pointer-events-none">
              {monthName} {day} — {spent > 0 ? `${formatCurrency(spent)} spent` : 'No spend'}
              
              {/* Tooltip Caret */}
              <svg
                className="absolute text-gray-900 h-2 w-full left-0 top-full"
                x="0px"
                y="0px"
                viewBox="0 0 255 255"
                xmlSpace="preserve"
              >
                <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-8 text-xs text-textSecondary font-medium">
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#EEF2FF]"></div> None</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#93C5FD]"></div> Low</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#4A90E2]"></div> Med</span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#1E40AF]"></div> High</span>
      </div>
    </div>
  );
};

export default SpendingHeatmap;
