/**
 * AIAdvice.jsx — PocketWise
 * Anthropic-powered AI financial advice card.
 */

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

const AIAdvice = () => {
  const { getTotalIncome, getTotalExpense, getBalance, getTransactionsByCategory } = useApp();

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return (
      <div className="bg-gradient-to-r from-[#4A90E2] to-[#7C6FF7] rounded-3xl p-6 text-white shadow-card-hover relative overflow-hidden">
        <Sparkles className="absolute -top-4 -right-4 w-28 h-28 text-white opacity-20 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-2 mb-3">
          <h2 className="text-xl font-bold">💡 AI Insight</h2>
        </div>
        <div className="relative z-10 flex items-center justify-between bg-red-500/20 p-4 rounded-xl border border-red-400/30">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle size={18} />
            <span>API key not configured</span>
          </div>
        </div>
      </div>
    );
  }
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const balance = getBalance();
  const cats = getTransactionsByCategory();
  const topCategory = cats.length > 0 ? cats[0].category : 'None';
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const fetchAdvice = async () => {
    console.log("API KEY:", import.meta.env.VITE_GEMINI_API_KEY);
    setLoading(true);
    setError(false);
    setAdvice('');

    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a student finance advisor. 
        Income: ₹${totalIncome}, Spent: ₹${totalExpense}, 
        Balance: ₹${balance}, Top category: ${topCategory}. 
        Give 2 short friendly money tips in 40 words. 
        Add 1 emoji per tip.`
            }]
          }],
          generationConfig: { maxOutputTokens: 150 }
        })
      });

      if (response.status === 429) {
        throw new Error("RATE_LIMIT");
      }
      if (!response.ok) {
        throw new Error("Failed to fetch advice");
      }

      const data = await response.json();
      console.log(data);
      setAdvice(data.candidates[0].content.parts[0].text);
    } catch (err) {
      console.error("AI Advice Error:", err);
      setError(true);
      if (err.message === "RATE_LIMIT") {
        setErrorMessage("⏳ Too many requests. \n  Please wait a moment and try again.");
      } else {
        setErrorMessage("Could not load advice. Try again.");
      }
    } finally {
      setLoading(false);
      setCooldown(60);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#4A90E2] to-[#7C6FF7] rounded-3xl p-6 text-white shadow-card-hover relative overflow-hidden">
      {/* Decorative background element */}
      <Sparkles className="absolute -top-4 -right-4 w-28 h-28 text-white opacity-20 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-bold">💡 AI Insight</h2>
        </div>

        {/* Initial State */}
        {!advice && !loading && !error && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/90 font-medium max-w-[65%]">
              Get instant, AI-powered tips based on your recent spending habits.
            </p>
            <button 
              onClick={fetchAdvice}
              disabled={cooldown > 0}
              className={`bg-white text-[#4A90E2] font-bold py-2 px-4 rounded-xl text-sm shadow-sm transition-all ${cooldown > 0 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-50 active:scale-95'}`}
            >
              {cooldown > 0 ? `Try again in ${cooldown}s...` : 'Get Advice'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center gap-3 text-sm font-semibold bg-white/20 p-4 rounded-xl animate-shimmer border border-white/10 shadow-inner">
            <Loader2 size={18} className="animate-spin" />
            <span>Analyzing your spending... 🤔</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-between bg-red-500/20 p-4 rounded-xl border border-red-400/30">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle size={18} />
              <span className="whitespace-pre-line">{errorMessage || "Could not load advice. Try again."}</span>
            </div>
            <button 
              onClick={fetchAdvice}
              disabled={cooldown > 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${cooldown > 0 ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30'}`}
            >
              {cooldown > 0 ? `Try again in ${cooldown}s...` : 'Retry'}
            </button>
          </div>
        )}

        {/* Success State */}
        {advice && !loading && (
          <div className="space-y-4">
            <div className="bg-white/20 p-4 rounded-xl text-sm leading-relaxed border border-white/10 whitespace-pre-wrap font-medium">
              {advice}
            </div>
            <button 
              onClick={fetchAdvice}
              disabled={cooldown > 0}
              className={`bg-white text-[#4A90E2] font-bold py-2 px-4 rounded-xl text-sm shadow-sm transition-all ${cooldown > 0 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-50 active:scale-95'}`}
            >
              {cooldown > 0 ? `Try again in ${cooldown}s...` : 'Get Advice'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvice;
