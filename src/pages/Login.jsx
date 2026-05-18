/**
 * Login.jsx — PocketWise
 * Premium split-layout authentication page.
 * Handles Login + Signup with Firebase (Email/Password & Google).
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ─── Feature bullets ──────────────────────────────────────────────────────────
const FEATURES = [
  'Daily expense tracking',
  'AI-powered insights',
  'Survive till month end',
];

// ─── Google SVG Icon ──────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.5-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.2C9.5 39.5 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C42 35.3 44 30 44 24c0-1.2-.1-2.5-.4-3.5z"/>
  </svg>
);

// ─── Password Strength Bar ────────────────────────────────────────────────────
const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'];
const STRENGTH_TEXT  = ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const score = getStrength(password);
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? STRENGTH_COLOR[score] : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${STRENGTH_TEXT[score]}`}>
        {STRENGTH_LABEL[score]}
      </p>
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, onClose }) => (
  <div className="fixed top-5 right-5 z-50 flex items-center gap-3
                  bg-red-500 text-white text-sm font-medium
                  px-4 py-3 rounded-xl shadow-lg
                  animate-slideInLeft max-w-xs">
    <X size={16} className="shrink-0" onClick={onClose} />
    <span>{message}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();

  const [tab,          setTab]          = useState('login');   // 'login' | 'signup'
  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [googleLoading,setGoogleLoading]= useState(false);
  const [error,        setError]        = useState('');

  // Clear error & inputs when switching tabs
  useEffect(() => {
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  }, [tab]);

  // ── Redirect helpers ───────────────────────────────────────────────────────
  const redirectUser = async (firebaseUser) => {
    try {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
      const data = snap.data();
      // If profile exists and has a college set → returning user → dashboard
      if (snap.exists() && data?.college) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch {
      navigate('/onboarding');
    }
  };

  // ── Google sign-in ─────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { isExisting } = await loginWithGoogle();
      if (isExisting) {
        navigate('/dashboard');   // returning user — skip onboarding
      } else {
        navigate('/onboarding');  // new user — complete profile first
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (tab === 'signup' && !name.trim()) { setError('Please enter your name.'); return; }
    if (tab === 'signup' && getStrength(password) < 2) {
      setError('Password is too weak. Use 8+ chars with a number or uppercase.');
      return;
    }

    setLoading(true);
    try {
      let user;
      if (tab === 'login') {
        user = await loginWithEmail(email, password);
      } else {
        user = await signupWithEmail(email, password, name.trim());
      }
      await redirectUser(user);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Firebase error → human message ────────────────────────────────────────
  const friendlyError = (code) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Incorrect email or password.';
      case 'auth/email-already-in-use':  return 'This email is already registered. Try logging in.';
      case 'auth/weak-password':         return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':         return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':  return 'Google sign-in was cancelled.';
      case 'auth/too-many-requests':     return 'Too many attempts. Please wait a moment.';
      default:                           return 'Something went wrong. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {error && <Toast message={error} onClose={() => setError('')} />}

      {/* ══════════════════════════════════════════════════════════════════════
          LEFT PANEL — Gradient (desktop only)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4A90E2] to-[#7C6FF7] flex-col items-center justify-center p-14 relative overflow-hidden">

        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="relative z-10 text-white text-center max-w-sm">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-4xl font-black text-white">PW</span>
          </div>

          {/* Brand */}
          <h1 className="text-4xl font-black tracking-tight mb-2">PocketWise</h1>
          <p className="text-lg text-white/80 italic mb-10">Spend Smart. Save More.</p>

          {/* Feature bullets */}
          <div className="flex flex-col gap-3 text-left">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                  <Check size={13} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT PANEL — Form
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-[#0F1117]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A90E2] to-[#7C6FF7] flex items-center justify-center shadow-md">
              <span className="text-white font-black text-lg">PW</span>
            </div>
            <span className="text-xl font-black text-[#1A1D2E] dark:text-white">
              Pocket<span className="text-[#4A90E2]">Wise</span>
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#1A1D2E] dark:text-white mb-1">
            {tab === 'login' ? 'Welcome Back 👋' : 'Join PocketWise 🚀'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {tab === 'login'
              ? 'Sign in to continue managing your finances.'
              : 'Create your account and start saving smarter.'}
          </p>

          {/* Tab Toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-[#1A1D2E] rounded-xl mb-6">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 capitalize ${
                  tab === t
                    ? 'bg-[#4A90E2] text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name — signup only */}
            {tab === 'signup' && (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                             bg-gray-50 dark:bg-[#1A1D2E] text-[#1A1D2E] dark:text-white text-sm
                             placeholder:text-gray-400 outline-none
                             focus:border-[#4A90E2] focus:bg-white dark:focus:bg-[#13151F]
                             focus:shadow-[0_0_0_3px_rgba(74,144,226,0.15)] transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-gray-50 dark:bg-[#1A1D2E] text-[#1A1D2E] dark:text-white text-sm
                           placeholder:text-gray-400 outline-none
                           focus:border-[#4A90E2] focus:bg-white dark:focus:bg-[#13151F]
                           focus:shadow-[0_0_0_3px_rgba(74,144,226,0.15)] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                             bg-gray-50 dark:bg-[#1A1D2E] text-[#1A1D2E] dark:text-white text-sm
                             placeholder:text-gray-400 outline-none
                             focus:border-[#4A90E2] focus:bg-white dark:focus:bg-[#13151F]
                             focus:shadow-[0_0_0_3px_rgba(74,144,226,0.15)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar — signup only */}
              {tab === 'signup' && <PasswordStrength password={password} />}
            </div>

            {/* Forgot password */}
            {tab === 'login' && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  className="text-xs text-[#4A90E2] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4A90E2] to-[#7C6FF7]
                         text-white font-bold text-sm shadow-md
                         hover:shadow-lg hover:opacity-95 active:scale-[0.98]
                         transition-all duration-200 flex items-center justify-center gap-2
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                tab === 'login' ? 'Login' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl
                       bg-white dark:bg-[#1A1D2E] border border-gray-200 dark:border-gray-700
                       text-[#1A1D2E] dark:text-white text-sm font-semibold
                       shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600
                       active:scale-[0.98] transition-all duration-200
                       disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            By continuing, you agree to PocketWise's{' '}
            <span className="text-[#4A90E2] cursor-pointer hover:underline">Terms</span> &amp;{' '}
            <span className="text-[#4A90E2] cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
