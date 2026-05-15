/**
 * LandingPage.jsx — PocketWise
 * Public landing page: hero, feature cards, footer.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, CalendarCheck, Target, Zap, ArrowRight } from 'lucide-react';

const FEATURES = [
  { emoji: '📅', title: 'Daily Check-in Tracking', desc: 'Log every rupee in seconds. See where your money goes, day by day, without the overwhelm.', color: 'from-blue-50 to-indigo-50' },
  { emoji: '🎯', title: 'Budget Goals & Alerts',   desc: 'Set category budgets and get warned before you overspend. Stay in control effortlessly.', color: 'from-purple-50 to-pink-50' },
  { emoji: '🆘', title: 'Survive Mode',            desc: 'Tight on cash? Survive Mode calculates your safe daily limit so you never go broke.',      color: 'from-red-50 to-orange-50' },
];

const FeatureCard = ({ emoji, title, desc, color }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add('opacity-100','translate-y-0'); }, { threshold: 0.15 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`opacity-0 translate-y-6 transition-all duration-700 ease-out bg-gradient-to-br ${color} rounded-card p-6 border border-white shadow-card`}>
      <div className="text-3xl mb-4 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">{emoji}</div>
      <h3 className="text-base font-bold text-textPrimary mb-2">{title}</h3>
      <p className="text-sm text-textSecondary leading-relaxed">{desc}</p>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Wallet size={18} className="text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight">
              <span className="text-textPrimary">Pocket</span><span className="text-primary">Wise</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/onboarding')} className="pw-btn-ghost text-sm">Log in</button>
            <button onClick={() => navigate('/onboarding')} className="pw-btn-primary text-sm">Get Started</button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <span className="pw-badge-primary mb-6 inline-flex">🎓 Built for students, by students</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-textPrimary leading-tight tracking-tight mt-4 mb-6">
            Spend Smart. <span className="gradient-text">Save More.</span>
          </h1>
          <p className="text-lg text-textSecondary max-w-xl mx-auto leading-relaxed mb-10">
            PocketWise is the <strong className="text-textPrimary font-semibold">student-first</strong> finance tracker that helps you log expenses, set budgets, and hit your saving goals — all without the spreadsheet chaos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/onboarding')} className="pw-btn-primary px-8 py-3.5 text-base gap-2">
              Start Tracking Free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/dashboard')} className="pw-btn-secondary px-8 py-3.5 text-base">
              View Demo
            </button>
          </div>
          <p className="text-xs text-textSecondary mt-6">No credit card • No ads • 100% free</p>
        </section>

        {/* Mock preview */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <div className="bg-white rounded-card shadow-card-hover border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-textSecondary">Balance this month</p>
                <p className="text-3xl font-bold text-textPrimary">₹3,840</p>
              </div>
              <span className="pw-badge-success">+12% vs last month</span>
            </div>
            {[{ label: '🍔 Food', pct: 72, color: 'bg-orange-400' }, { label: '🚌 Transport', pct: 40, color: 'bg-blue-400' }, { label: '🎮 Fun', pct: 88, color: 'bg-danger' }].map(({ label, pct, color }) => (
              <div key={label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-textSecondary">{label}</span>
                  <span className="text-textPrimary font-semibold">{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary text-center mb-10">
            Everything a student needs to <span className="gradient-text">stay financially fit</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center">
        <p className="text-sm text-textSecondary">PocketWise © 2024 — Made for students ❤️</p>
      </footer>
    </div>
  );
};

export default LandingPage;
