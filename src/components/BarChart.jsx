/**
 * BarChart.jsx — PocketWise
 * Recharts grouped bar chart: Income vs Expense per month.
 * Props: data = [{ month, income, expense }]
 */

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../utils/helpers';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-card rounded-btn px-4 py-3 text-sm min-w-[140px]">
      <p className="font-semibold text-textPrimary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-textSecondary capitalize">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.fill }}
            />
            {p.dataKey}
          </span>
          <span className="font-bold" style={{ color: p.fill }}>
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Custom Legend ────────────────────────────────────────────────────────────
const CustomLegend = () => (
  <div className="flex items-center justify-center gap-6 mt-1 mb-2">
    {[
      { color: '#4A90E2', label: 'Income'  },
      { color: '#7C6FF7', label: 'Expense' },
    ].map(({ color, label }) => (
      <span key={label} className="flex items-center gap-1.5 text-xs text-textSecondary">
        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        {label}
      </span>
    ))}
  </div>
);

// ─── Rounded Bar Shape ────────────────────────────────────────────────────────
const RoundedBar = (props) => {
  const { x, y, width, height, fill } = props;
  if (height <= 0) return null;
  const r = Math.min(4, width / 2);
  return (
    <path
      d={`M${x},${y + height}
          L${x},${y + r}
          Q${x},${y} ${x + r},${y}
          L${x + width - r},${y}
          Q${x + width},${y} ${x + width},${y + r}
          L${x + width},${y + height}
          Z`}
      fill={fill}
    />
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const BarChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-textSecondary text-sm">
        <span className="text-4xl mb-2">📈</span>
        No monthly data yet
      </div>
    );
  }

  // Y-axis tick formatter
  const formatY = (v) =>
    v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`;

  return (
    <div className="w-full">
      <CustomLegend />
      <ResponsiveContainer width="100%" height={220}>
        <RechartsBarChart
          data={data}
          barCategoryGap="30%"
          barGap={4}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F1F4F9"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: '#8A92A6', fontSize: 12, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatY}
            tick={{ fill: '#8A92A6', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFF' }} />
          <Bar dataKey="income"  fill="#4A90E2" shape={<RoundedBar />} maxBarSize={28} />
          <Bar dataKey="expense" fill="#7C6FF7" shape={<RoundedBar />} maxBarSize={28} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
