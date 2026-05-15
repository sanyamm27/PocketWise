/**
 * DonutChart.jsx — PocketWise
 * Recharts donut/pie chart with center total and custom legend.
 * Props: data = [{ name, value, color }]
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/helpers';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="bg-white border border-gray-100 shadow-card rounded-btn px-3 py-2 text-sm">
      <p className="font-semibold text-textPrimary">{name}</p>
      <p className="text-primary font-bold">{formatCurrency(value)}</p>
    </div>
  );
};

// ─── Center Label (rendered as SVG foreignObject) ─────────────────────────────
const CenterLabel = ({ cx, cy, total }) => (
  <g>
    <text
      x={cx} y={cy - 8}
      textAnchor="middle"
      className="fill-textPrimary"
      style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 700, fill: '#1A1D2E' }}
    >
      {formatCurrency(total)}
    </text>
    <text
      x={cx} y={cy + 14}
      textAnchor="middle"
      style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fill: '#8A92A6' }}
    >
      This month
    </text>
  </g>
);

// ─── Component ────────────────────────────────────────────────────────────────
const DonutChart = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-textSecondary text-sm">
        <span className="text-4xl mb-2">📊</span>
        No expense data yet
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── Donut Chart ──────────────────────────────────────────────── */}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            {/* Center label via customized label */}
          </Pie>
          {/* Center total — rendered as SVG text inside Pie */}
          <Pie
            data={[{ value: 1 }]}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={0}
            dataKey="value"
            label={(props) => <CenterLabel {...props} total={total} />}
            labelLine={false}
            isAnimationActive={false}
          >
            <Cell fill="transparent" />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* ── Legend ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 px-2">
        {data.map((entry, i) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-textSecondary truncate">{entry.name}</span>
              <span className="text-xs font-semibold text-textPrimary ml-auto shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonutChart;
