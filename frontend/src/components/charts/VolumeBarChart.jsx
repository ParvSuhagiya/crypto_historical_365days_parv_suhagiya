import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { extractArray } from '../../utils/formatters';

export default function VolumeBarChart({ gainers = [], losers = [], height = 300 }) {
  const gainerData = extractArray(gainers).slice(0, 5).map((c) => ({
    name: c.symbol || c.name || 'Coin',
    gainers: Number(c.return24h ?? c.return ?? c.change ?? 0),
    losers: 0,
  }));

  const loserData = extractArray(losers).slice(0, 5).map((c) => ({
    name: c.symbol || c.name || 'Coin',
    gainers: 0,
    losers: Math.abs(Number(c.return24h ?? c.return ?? c.change ?? 0)),
  }));

  const merged = {};
  [...gainerData, ...loserData].forEach((item) => {
    if (!merged[item.name]) merged[item.name] = { name: item.name, gainers: 0, losers: 0 };
    merged[item.name].gainers += item.gainers;
    merged[item.name].losers += item.losers;
  });

  const chartData = Object.values(merged);

  if (!chartData.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
        No chart data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
        <Legend />
        <Bar dataKey="gainers" fill="#10B981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="losers" fill="#EF4444" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
