/**
 * Navbar.jsx — PocketWise Top Navigation Bar
 *
 * - Desktop: logo left | nav links center | user avatar right
 * - Mobile:  logo left | hamburger right → slide-down menu
 * - Sticky, white background, subtle bottom border
 */

import { NavLink } from 'react-router-dom';
import {
  Wallet, LayoutDashboard, ArrowLeftRight,
  Target, BarChart2, Menu, X,
} from 'lucide-react';
import { useApp }  from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight  },
  { to: '/budget',       label: 'Budget',       icon: Target          },
  { to: '/insights',     label: 'Insights',     icon: BarChart2       },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { setIsMobileMenuOpen } = useApp();
  const { user, userProfile }   = useAuth();

  // Dynamic initials — works for every user
  const displayName = userProfile?.name || user?.displayName || 'PW';
  const initials    = displayName
    .trim().split(' ').filter(Boolean)
    .map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'PW';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#13151F] border-b border-[#F1F5F9] dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Left Side (Mobile Hamburger) ───────────────────────────── */}
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 mr-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* ── Desktop Nav Links (center) ────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-[#4A90E2]/10 text-[#4A90E2]'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-[#4A90E2]' : 'text-gray-400'} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right: Avatar ─────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/profile"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500
                         flex items-center justify-center text-white text-xs font-bold
                         shadow-sm hover:shadow-md transition-shadow duration-200"
              title={user?.displayName ?? 'Profile'}
            >
              {initials}
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
