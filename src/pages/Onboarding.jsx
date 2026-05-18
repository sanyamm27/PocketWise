/**
 * Onboarding.jsx — PocketWise
 * 3-step onboarding: Name/College → Budget → Income Sources
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const INCOME_SOURCES = ['Pocket Money', 'Part-time Job', 'Scholarship', 'Freelance'];

const TOTAL_STEPS = 3;

const Onboarding = () => {
  const { setMonthlyBudget } = useApp();
  const { user, setUserProfile } = useAuth();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(1);
  const [name,    setName]    = useState('');
  const [college, setCollege] = useState('');
  const [budget,  setBudget]  = useState(8000);
  const [sources, setSources] = useState([]);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!name.trim())    e.name    = 'Please enter your name.';
      if (!college.trim()) e.college = 'Please enter your college name.';
    }
    if (step === 3 && sources.length === 0) {
      e.sources = 'Please select at least one income source.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleSource = (src) =>
    setSources((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    );

  const handleNext = async () => {
    if (!validate()) return;
    if (step < TOTAL_STEPS) { setStep((s) => s + 1); return; }

    // Final step — save to Firestore under this user's uid
    setSaving(true);
    try {
      const updatedProfile = {
        name:           name.trim(),
        college:        college.trim(),
        monthlyBudget:  Number(budget),
        incomeSources:  sources,
        updatedAt:      new Date().toISOString(),
      };
      await updateDoc(doc(db, 'users', user.uid), updatedProfile);
      // Update budget in AppContext (local + Firestore already done above)
      setMonthlyBudget(Number(budget));
      // Update AuthContext profile immediately so UI reflects new data
      setUserProfile(prev => ({ ...prev, ...updatedProfile }));
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding save failed:', err);
      setSaving(false);
    }
  };

  const pctWidth = `${(step / TOTAL_STEPS) * 100}%`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-sm mb-3">
            <Wallet size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-textPrimary">Pocket</span>
            <span className="text-primary">Wise</span>
          </span>
        </div>

        {/* ── Progress Bar ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-textSecondary mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: pctWidth }}
            />
          </div>
        </div>

        {/* ── Card ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-card shadow-card p-8 animate-fade-in">

          {/* ── Step 1: Name + College ──────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-textPrimary">Hey there! 👋</h2>
                <p className="text-sm text-textSecondary mt-1">Let's get your account set up in 3 quick steps.</p>
              </div>
              <div>
                <label className="pw-label">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arjun Sharma"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                  className="pw-input mt-1"
                  autoFocus
                />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="pw-label">College / University</label>
                <input
                  type="text"
                  placeholder="e.g. IIT Delhi"
                  value={college}
                  onChange={(e) => { setCollege(e.target.value); setErrors((p) => ({ ...p, college: '' })); }}
                  className="pw-input mt-1"
                />
                {errors.college && <p className="text-xs text-danger mt-1">{errors.college}</p>}
              </div>
            </div>
          )}

          {/* ── Step 2: Monthly Budget Slider ───────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-textPrimary">Set your monthly budget 🎯</h2>
                <p className="text-sm text-textSecondary mt-1">How much do you plan to spend each month? You can change this anytime.</p>
              </div>

              {/* Big budget display */}
              <div className="text-center py-4">
                <p className="text-5xl font-bold text-primary">
                  ₹{budget.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-textSecondary mt-2">per month</p>
              </div>

              {/* Slider */}
              <div>
                <input
                  type="range"
                  min={500}
                  max={20000}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-primary h-2 rounded-full cursor-pointer"
                  aria-label="Monthly budget slider"
                />
                <div className="flex justify-between text-xs text-textSecondary mt-2">
                  <span>₹500</span>
                  <span>₹20,000</span>
                </div>
              </div>

              {/* Quick presets */}
              <div className="flex gap-2 flex-wrap">
                {[3000, 5000, 8000, 12000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setBudget(v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-chip border transition-all ${
                      budget === v
                        ? 'bg-primary text-white border-primary'
                        : 'bg-gray-50 text-textSecondary border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    ₹{v.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Income Sources ──────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-textPrimary">Where's your money from? 💰</h2>
                <p className="text-sm text-textSecondary mt-1">Select all that apply. This helps us personalise your dashboard.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INCOME_SOURCES.map((src) => (
                  <button
                    key={src}
                    onClick={() => { toggleSource(src); setErrors((p) => ({ ...p, sources: '' })); }}
                    className={`py-3.5 px-4 rounded-btn text-sm font-semibold border-2 transition-all duration-150 text-left ${
                      sources.includes(src)
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-gray-100 bg-gray-50 text-textSecondary hover:border-gray-300'
                    }`}
                    aria-pressed={sources.includes(src)}
                  >
                    {src === 'Pocket Money'  && '💰 '}
                    {src === 'Part-time Job' && '💼 '}
                    {src === 'Scholarship'   && '🏆 '}
                    {src === 'Freelance'     && '💻 '}
                    {src}
                  </button>
                ))}
              </div>
              {errors.sources && <p className="text-xs text-danger">{errors.sources}</p>}
            </div>
          )}

          {/* ── Navigation Buttons ──────────────────────────────────────── */}
          <div className="flex items-center gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="pw-btn-ghost gap-1.5"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={saving}
              className="pw-btn-primary flex-1 py-3 gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {step === TOTAL_STEPS
                ? saving ? 'Saving...' : "Let's Go 🚀"
                : 'Next'}
              {step < TOTAL_STEPS && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i + 1 === step ? 'bg-primary w-5' : i + 1 < step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
