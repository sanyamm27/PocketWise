/**
 * App.jsx — PocketWise
 * React Router v6 setup with protected routes and AppProvider.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// ── Pages ─────────────────────────────────────────────────────────────────────
import LandingPage   from './pages/LandingPage';
import Onboarding    from './pages/Onboarding';
import Dashboard     from './pages/Dashboard';
import Transactions  from './pages/Transactions';
import BudgetGoals   from './pages/BudgetGoals';
import Insights      from './pages/Insights';
import SurviveMode   from './pages/SurviveMode';
import Profile       from './pages/Profile';

// ─── Protected Route ──────────────────────────────────────────────────────────
// Redirects to "/" if no user is logged in via AppContext.
const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  return user ? children : <Navigate to="/" replace />;
};

// ─── App Routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/"            element={<LandingPage />} />
    <Route path="/onboarding"  element={<Onboarding />} />

    {/* Protected routes */}
    <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/transactions"element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
    <Route path="/budget"      element={<ProtectedRoute><BudgetGoals /></ProtectedRoute>} />
    <Route path="/insights"    element={<ProtectedRoute><Insights /></ProtectedRoute>} />
    <Route path="/survive"     element={<ProtectedRoute><SurviveMode /></ProtectedRoute>} />
    <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />

    {/* Catch-all → redirect to landing */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// ─── Root App ─────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </BrowserRouter>
);

export default App;
