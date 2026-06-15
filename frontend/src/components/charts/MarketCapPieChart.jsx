import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PIE_COLORS } from '../../utils/constants';
import { extractArray } from '../../utils/formatters';

export default function MarketCapPieChart({ data, height = 300 }) {
  const chartData = extractArray(data).slice(0, 5).map((item, idx) => ({
    name: item.name || item.symbol || item.label || `Segment ${idx + 1}`,
    value: Number(item.marketCap ?? item.value ?? item.total ?? 0),
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
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
