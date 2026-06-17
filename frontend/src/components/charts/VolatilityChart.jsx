import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { extractArray } from '../../utils/formatters';

export default function VolatilityChart({ data, height = 300 }) {
  const chartData = extractArray(data).map((item, idx) => ({
    name: item.name || item.symbol || item.label || `#${idx + 1}`,
    volatility: Number(item.volatility ?? item.value ?? 0),
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
        No chart data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
        <Area
          type="monotone"
          dataKey="volatility"
          stroke="#F59E0B"
          fill="#FEF3C7"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
