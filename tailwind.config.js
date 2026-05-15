/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan all source files for class names
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      // ─── PocketWise Color Palette ───────────────────────────────────
      colors: {
        primary:       '#4A90E2', // Sky Blue  — CTAs, links, active states
        accent:        '#7C6FF7', // Soft Purple — charts, goals, secondary highlights
        background:    '#F8FAFF', // Cool off-white — page background
        card:          '#FFFFFF', // Pure white — card surfaces
        success:       '#3ECF8E', // Mint green — income, positive balance
        danger:        '#FF6B6B', // Coral red  — expenses, over-budget alerts
        textPrimary:   '#1A1D2E', // Deep navy  — headings, amounts
        textSecondary: '#8A92A6', // Muted grey — labels, meta info
      },

      // ─── Typography ─────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // ─── Border Radius ───────────────────────────────────────────────
      borderRadius: {
        card: '16px',  // Cards, modals, panels
        btn:  '12px',  // Buttons, inputs
        chip: '999px', // Tags, badges, pills
      },

      // ─── Box Shadows ─────────────────────────────────────────────────
      boxShadow: {
        card:    '0 2px 16px rgba(0, 0, 0, 0.06)',   // Default card lift
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.10)', // Card on hover
        modal:   '0 16px 48px rgba(0, 0, 0, 0.14)', // Modals / overlays
        input:   '0 0 0 3px rgba(74, 144, 226, 0.20)', // Focus ring
      },

      // ─── Spacing Extensions ──────────────────────────────────────────
      spacing: {
        18:  '4.5rem',
        22:  '5.5rem',
        72:  '18rem',
        84:  '21rem',
        96:  '24rem',
        128: '32rem',
      },

      // ─── Transitions ─────────────────────────────────────────────────
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ─── Animation ───────────────────────────────────────────────────
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-out both',
        'slide-up': 'slideUp 0.4s ease-out both',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
      },
    },
  },

  plugins: [],
};
