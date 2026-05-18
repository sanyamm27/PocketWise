/**
 * Sidebar.jsx — PocketWise Desktop Sidebar
 *
 * 240px wide, white background, right border.
 * Shows nav links with lucide icons, active pill, and user info at bottom.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  Wallet, LayoutDashboard, ArrowLeftRight,
  Target, BarChart2, Zap, User, LogOut, X, Moon, Sun
} from 'lucide-react';
import { useApp }  from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

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
  const { user, isMobileMenuOpen, setIsMobileMenuOpen, darkMode, toggleDarkMode } = useApp();
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PW';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-[240px] bg-white dark:bg-[#13151F] border-r border-[#F1F5F9] dark:border-gray-800 shadow-[4px_0_24px_rgba(0,0,0,0.04)] overflow-y-auto z-50 flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full lg:flex hidden'}`}
      aria-label="Sidebar navigation"
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-6 pb-8 px-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A90E2] to-[#7C6FF7] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">PW</span>
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-[#1A1D2E] dark:text-white">Pocket</span>
            <span className="text-[#4A90E2]">Wise</span>
          </span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-1.5" aria-label="Sidebar links">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center mx-2 px-4 py-3 rounded-xl text-sm transition-all duration-150 group ${
                 isActive
                   ? 'bg-gradient-to-r from-[#EEF6FF] to-[#F0EEFF] dark:from-[#4A90E2]/10 dark:to-[#7C6FF7]/10 text-[#4A90E2] font-semibold border-l-[3px] border-[#4A90E2]'
                   : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white border-l-[3px] border-transparent font-medium'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  className={`shrink-0 mr-3 transition-colors ${
                    isActive ? 'text-[#4A90E2]' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span>{label}</span>

                {/* Survive Mode warning dot */}
                {label === 'Survive Mode' && !isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse-soft shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User Info + Logout ────────────────────────────────────────── */}
      <div className="px-5 py-6 border-t border-[#F1F5F9] dark:border-gray-800">
        {/* User card */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500
                       flex items-center justify-center text-white text-sm font-bold shrink-0"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1A1D2E] dark:text-white truncate">
              {user?.displayName ?? 'Student'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.college ?? 'PocketWise User'}
            </p>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkMode}
          className="flex items-center gap-3 w-full 
          px-4 py-3 rounded-xl transition-all mb-2
          text-gray-500 hover:bg-gray-50
          dark:text-gray-400 dark:hover:bg-gray-800">
          {darkMode 
            ? <Sun size={20} className="text-yellow-400"/> 
            : <Moon size={20} className="text-blue-400"/>}
          <span className="text-sm font-medium">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                     text-sm font-medium text-red-400
                     hover:bg-red-50 hover:text-red-600
                     dark:hover:bg-red-500/10 dark:hover:text-red-400
                     transition-colors duration-150"
        >
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
