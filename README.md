# PocketWise — Spend Smart. Save More.

> A student-first income and expense tracker built with React + Tailwind CSS.

---

## ✨ Features

| Page | Route | Description |
|------|-------|-------------|
| 🏠 Landing Page | `/` | Hero, feature cards, CTA |
| 👋 Onboarding | `/onboarding` | 3-step setup: name, budget, income source |
| 📊 Dashboard | `/dashboard` | Balance overview, quick actions, recent transactions |
| 💸 Transactions | `/transactions` | Full history with search and filter chips |
| 🎯 Budget & Goals | `/budget` | Category budgets + savings goals with rings |
| 📈 Insights | `/insights` | Donut chart, bar chart, money personality |
| 🆘 Survive Mode | `/survive` | Daily spending limit calculator |
| 👤 Profile | `/profile` | Settings, export data, logout |

---

## 🛠 Tech Stack

- **React 18** + **Vite** — Fast, modern frontend
- **Tailwind CSS** — Utility-first styling with custom design tokens
- **React Router DOM v6** — Client-side routing with protected routes
- **Recharts** — Donut and bar charts
- **Lucide React** — Clean, consistent icons
- **Firebase** — Authentication (Google + email)
- **localStorage** — Offline-first data persistence

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#4A90E2` | Buttons, links, active states |
| `accent` | `#7C6FF7` | Charts, goals, highlights |
| `background` | `#F8FAFF` | Page background |
| `card` | `#FFFFFF` | Card surfaces |
| `success` | `#3ECF8E` | Income, positive balance |
| `danger` | `#FF6B6B` | Expenses, budget alerts |
| `textPrimary` | `#1A1D2E` | Headings, amounts |
| `textSecondary` | `#8A92A6` | Labels, meta info |
| Font | `Inter` | All text (Google Fonts) |
| Card Radius | `16px` | Cards, modals |
| Button Radius | `12px` | Buttons, inputs |

---

## 📁 Folder Structure

```
pocketwise/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── logo.svg
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TransactionCard.jsx
│   │   ├── BudgetProgressBar.jsx
│   │   ├── StreakBadge.jsx
│   │   ├── AddTransactionModal.jsx
│   │   ├── DonutChart.jsx
│   │   ├── BarChart.jsx
│   │   └── GoalRing.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── Onboarding.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   ├── BudgetGoals.jsx
│   │   ├── Insights.jsx
│   │   ├── SurviveMode.jsx
│   │   └── Profile.jsx
│   ├── context/
│   │   └── AppContext.jsx
│   ├── utils/
│   │   └── helpers.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

---

Built for students, by students 💙
