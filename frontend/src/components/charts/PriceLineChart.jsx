import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { extractArray } from '../../utils/formatters';

export default function PriceLineChart({ data, dataKey = 'price', xKey = 'date', height = 300 }) {
  const chartData = extractArray(data).map((item, idx) => ({
    ...item,
    date: item.date || item.month || item.label || item.name || `#${idx + 1}`,
    price: Number(item.price ?? item.value ?? item.average ?? 0),
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
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey={xKey} tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
        />
        <Line type="monotone" dataKey={dataKey} stroke="#3B82F6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
