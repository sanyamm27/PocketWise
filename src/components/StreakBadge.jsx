/**
 * StreakBadge.jsx — PocketWise
 * Fire streak pill badge. Pulses when streak > 7 days.
 */

const StreakBadge = ({ streakCount = 0 }) => {
  const isHot = streakCount > 7;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5
                  rounded-chip text-white text-xs font-bold
                  bg-gradient-to-r from-orange-400 to-red-500
                  shadow-sm select-none
                  ${isHot ? 'animate-pulse-soft' : ''}`}
      title={`${streakCount}-day logging streak`}
    >
      <span className="text-sm leading-none">🔥</span>
      {streakCount} Day{streakCount !== 1 ? 's' : ''} Streak
    </span>
  );
};

export default StreakBadge;
