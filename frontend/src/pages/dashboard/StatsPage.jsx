import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchStatsBundle, fetchMarketSummary } from '../../features/stats/statsSlice';
import Card from '../../components/ui/Card';
import { StatCardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import PriceLineChart from '../../components/charts/PriceLineChart';
import VolatilityChart from '../../components/charts/VolatilityChart';
import { formatCompact, formatCurrency, formatNumber } from '../../utils/formatters';
import { APP_NAME } from '../../utils/constants';

// Simple bar chart for distributions using divs (no recharts needed)
function DistributionBar({ data, labelKey, valueKey = 'count' }) {
  if (!data?.length) return <p className="text-sm text-slate-400 py-4 text-center">No data</p>;
  const max = Math.max(...data.map((d) => d[valueKey] || 0));
  return (
    <div className="space-y-3 pt-2">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{item[labelKey] || item.bucket || item.range || item.label || `Item ${i+1}`}</span>
            <span className="font-medium text-slate-700">{item[valueKey]}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${max ? (item[valueKey] / max) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  const dispatch = useDispatch();
  const { summary, distributions, timeAnalysis, loading, error } = useSelector((s) => s.stats);

  useEffect(() => {
    dispatch(fetchMarketSummary());
    dispatch(fetchStatsBundle());
  }, [dispatch]);

  const reload = () => {
    dispatch(fetchMarketSummary());
    dispatch(fetchStatsBundle());
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-8">
      <Helmet><title>Statistics | {APP_NAME}</title></Helmet>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Statistics</h1>
        <p className="text-sm text-slate-600">Market distributions and time-based analysis</p>
      </div>

      {/* Market Summary */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Market Summary</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Market Cap</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCompact(summary?.totalMarketCap)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Average Price</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(summary?.averagePrice)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Volume</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCompact(summary?.totalVolume)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Coins</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatNumber(summary?.totalCoins)}</p>
            </Card>
          </div>
        )}
      </section>

      {/* Distributions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Distribution Charts</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card title="Price Distribution">
            {loading ? <TableSkeleton rows={4} /> : (
              <DistributionBar data={distributions.priceDistribution} labelKey="bucket" />
            )}
          </Card>
          <Card title="Rank Distribution">
            {loading ? <TableSkeleton rows={4} /> : (
              <DistributionBar data={distributions.rankDistribution} labelKey="range" />
            )}
          </Card>
          <Card title="Volatility Distribution">
            {loading ? <TableSkeleton rows={4} /> : (
              <DistributionBar data={distributions.volatilityDistribution} labelKey="bucket" />
            )}
          </Card>
        </div>
      </section>

      {/* Time Analysis */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Time Analysis</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card title="Daily Analysis">
            {loading ? <TableSkeleton rows={4} /> : (
              // daily items have: date, avgPrice, avgReturn, totalVolume
              <PriceLineChart data={timeAnalysis.daily || []} xKey="date" dataKey="avgPrice" />
            )}
          </Card>
          <Card title="Monthly Analysis">
            {loading ? <TableSkeleton rows={4} /> : (
              // monthly items have: month, avgPrice, totalVolume, count
              <PriceLineChart data={timeAnalysis.monthly || []} xKey="month" dataKey="avgPrice" />
            )}
          </Card>
          <Card title="Yearly Analysis">
            {loading ? <TableSkeleton rows={4} /> : (
              // yearly items have: year, avgPrice, totalVolume
              <PriceLineChart data={timeAnalysis.yearly || []} xKey="year" dataKey="avgPrice" />
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}