/**
 * App.jsx — PocketWise
 * React Router v6 setup with Firebase-backed auth and protected routes.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }         from './context/AuthContext';
import { AppProvider, useApp }  from './context/AppContext';
import { useAuth }              from './context/AuthContext';

// ── Pages ──────────────────────────────────────────────────────────────────────
import Login        from './pages/Login';
import Onboarding   from './pages/Onboarding';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import BudgetGoals  from './pages/BudgetGoals';
import Insights     from './pages/Insights';
import SurviveMode  from './pages/SurviveMode';
import Profile      from './pages/Profile';

// ─── Protected Route ──────────────────────────────────────────────────────────
// Redirects unauthenticated users to /login.
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// ─── App Routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { darkMode } = useApp();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#F8FAFF] dark:bg-[#0F1117]">
        <Routes>
          {/* Root → redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public */}
          <Route path="/login"      element={<Login />} />

          {/* Protected */}
          <Route path="/onboarding"  element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions"element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/budget"      element={<ProtectedRoute><BudgetGoals /></ProtectedRoute>} />
          <Route path="/insights"    element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/survive"     element={<ProtectedRoute><SurviveMode /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Catch-all → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
// AuthProvider must wrap AppProvider because AppContext depends on useAuth().
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
