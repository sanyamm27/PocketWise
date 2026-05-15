/**
 * Sidebar.jsx — PocketWise Desktop Sidebar
 *
 * 240px wide, white background, right border.
 * Shows nav links with lucide icons, active pill, and user info at bottom.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  Wallet, LayoutDashboard, ArrowLeftRight,
  Target, BarChart2, Zap, User, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight  },
  { to: '/budget',       label: 'Budget & Goals', icon: Target        },
  { to: '/insights',     label: 'Insights',     icon: BarChart2       },
  { to: '/survive',      label: 'Survive Mode', icon: Zap             },
  { to: '/profile',      label: 'Profile',      icon: User            },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const { user, logoutUser } = useApp();
  const navigate = useNavigate();

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PW';

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <aside
      className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-gray-100 shrink-0"
      aria-label="Sidebar navigation"
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <Wallet size={18} className="text-white" />
        </div>
        <span className="text-[17px] font-bold tracking-tight">
          <span className="text-textPrimary">Pocket</span>
          <span className="text-primary">Wise</span>
        </span>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Sidebar links">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium
               transition-all duration-150 group ${
                 isActive
                   ? 'bg-primary text-white shadow-sm'
                   : 'text-textSecondary hover:bg-gray-50 hover:text-textPrimary'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-textSecondary group-hover:text-primary'
                  }`}
                />
                <span>{label}</span>

                {/* Survive Mode warning dot */}
                {label === 'Survive Mode' && !isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-danger animate-pulse-soft" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User Info + Logout ────────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-gray-100">
        {/* User card */}
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent
                       flex items-center justify-center text-white text-xs font-bold shrink-0"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-textPrimary truncate">
              {user?.displayName ?? 'Student'}
            </p>
            <p className="text-xs text-textSecondary truncate">
              {user?.college ?? 'PocketWise User'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-btn
                     text-sm font-medium text-textSecondary
                     hover:bg-red-50 hover:text-danger
                     transition-colors duration-150"
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
