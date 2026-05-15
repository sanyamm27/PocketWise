/**
 * Navbar.jsx — PocketWise Top Navigation Bar
 *
 * - Desktop: logo left | nav links center | user avatar right
 * - Mobile:  logo left | hamburger right → slide-down menu
 * - Sticky, white background, subtle bottom border
 */

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Wallet, LayoutDashboard, ArrowLeftRight,
  Target, BarChart2, Menu, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight  },
  { to: '/budget',       label: 'Budget',       icon: Target          },
  { to: '/insights',     label: 'Insights',     icon: BarChart2       },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { user } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  /** Derive user initials for the avatar bubble */
  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PW';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────────────────────────── */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 no-select"
            aria-label="PocketWise home"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Wallet size={18} className="text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight">
              <span className="text-textPrimary">Pocket</span>
              <span className="text-primary">Wise</span>
            </span>
          </NavLink>

          {/* ── Desktop Nav Links (center) ────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2 rounded-btn text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-primary'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-gray-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-primary' : 'text-textSecondary'} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right: Avatar + Mobile Hamburger ─────────────────────── */}
          <div className="flex items-center gap-3">
            {/* User avatar */}
            <NavLink
              to="/profile"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent
                         flex items-center justify-center text-white text-xs font-bold
                         shadow-sm hover:shadow-md transition-shadow duration-200"
              title={user?.displayName ?? 'Profile'}
            >
              {initials}
            </NavLink>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-btn text-textSecondary hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ──────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 animate-fade-in">
          <nav className="flex flex-col gap-1 pt-2" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-primary'
                      : 'text-textSecondary hover:bg-gray-50 hover:text-textPrimary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? 'text-primary' : 'text-textSecondary'} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
