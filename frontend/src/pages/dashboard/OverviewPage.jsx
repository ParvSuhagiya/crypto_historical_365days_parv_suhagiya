import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import { StatCardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import PriceLineChart from '../../components/charts/PriceLineChart';
import VolumeBarChart from '../../components/charts/VolumeBarChart';
import MarketCapPieChart from '../../components/charts/MarketCapPieChart';
import { statsAPI } from '../../api/statsAPI';
import { analyticsAPI } from '../../api/analyticsAPI';
import { coinAPI } from '../../api/coinAPI';
import {
  formatCurrency,
  formatCompact,
  formatNumber,
  formatPercent,
  getReturnColor,
} from '../../utils/formatters';
import { APP_NAME } from '../../utils/constants';

function StatCard({ label, value, loading }) {
  if (loading) return <StatCardSkeleton />;
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value ?? '—'}</p>
    </Card>
  );
}

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [monthlyAnalysis, setMonthlyAnalysis] = useState([]);
  const [marketCapData, setMarketCapData] = useState([]);
  const [topMarketCap, setTopMarketCap] = useState([]);
  const [trending, setTrending] = useState([]);
  const [volatilityAlerts, setVolatilityAlerts] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        marketSummaryRes,
        coinCountRes,
        topGainersRes,
        topLosersRes,
        monthlyRes,
        marketCapRes,
        topCapRes,
        trendingRes,
        volatilityRes,
      ] = await Promise.all([
        statsAPI.marketSummary(),
        statsAPI.coinCount(),
        statsAPI.topGainers({ limit: 5 }),
        statsAPI.topLosers({ limit: 5 }),
        statsAPI.monthlyAnalysis(),
        statsAPI.marketCap(),
        coinAPI.topMarketCap({ limit: 5 }),
        coinAPI.trending({ limit: 5 }),
        coinAPI.highVolatilityAlerts({ limit: 5 }),
      ]);

      // ✅ market-summary returns data.items[] — aggregate manually
      const summaryItems = marketSummaryRes.data?.data?.items || [];
      const totalMarketCap = summaryItems.reduce((sum, c) => sum + (c.avgMarketCap || 0), 0);
      const totalVolume = summaryItems.reduce((sum, c) => sum + (c.totalVolume || 0), 0);
      const avgPrice =
        summaryItems.length > 0
          ? summaryItems.reduce((sum, c) => sum + (c.avgPrice || 0), 0) / summaryItems.length
          : 0;

      // ✅ coin-count returns data.uniqueCoinCount
      const countData = coinCountRes.data?.data || {};
      const totalCoins = countData.uniqueCoinCount ?? countData.totalRecords;

      setStats({ totalCoins, averagePrice: avgPrice, totalMarketCap, averageVolume: totalVolume });

      // ✅ top gainers/losers — direct arrays
      setGainers(topGainersRes.data?.data || []);
      setLosers(topLosersRes.data?.data || []);

      // ✅ monthly analysis — direct array
      setMonthlyAnalysis(monthlyRes.data?.data || []);

      // ✅ market cap stats — direct array or items
      const mcRaw = marketCapRes.data?.data;
      setMarketCapData(Array.isArray(mcRaw) ? mcRaw : mcRaw?.items || []);

      // ✅ top market cap coins — direct array
      setTopMarketCap(topCapRes.data?.data || []);

      // ✅ trending — direct array
      setTrending(trendingRes.data?.data || []);

      // ✅ high volatility — data.items[] nested inside data
      const volRaw = volatilityRes.data?.data;
      setVolatilityAlerts(Array.isArray(volRaw) ? volRaw : volRaw?.items || []);

    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load dashboard';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const coinColumns = [
    { key: 'name', label: 'Name', render: (r) => r.name },
    { key: 'symbol', label: 'Symbol', render: (r) => r.symbol?.toUpperCase() },
    { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
    {
      key: 'return',
      label: '24h',
      render: (r) => (
        <span className={getReturnColor(r.dailyReturn ?? r.return24h ?? r.return)}>
          {formatPercent(r.dailyReturn ?? r.return24h ?? r.return)}
        </span>
      ),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Overview | {APP_NAME}</title>
      </Helmet>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-600">Real-time crypto market analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Coins" value={formatNumber(stats.totalCoins)} loading={loading} />
        <StatCard label="Average Price" value={formatCurrency(stats.averagePrice)} loading={loading} />
        <StatCard label="Total Market Cap" value={formatCompact(stats.totalMarketCap)} loading={loading} />
        <StatCard label="Total Volume" value={formatCompact(stats.averageVolume)} loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Top Gainers vs Losers">
          {loading ? (
            <TableSkeleton rows={4} cols={1} />
          ) : (
            <VolumeBarChart gainers={gainers} losers={losers} />
          )}
        </Card>
        <Card title="Monthly Analysis">
          {loading ? (
            <TableSkeleton rows={4} cols={1} />
          ) : (
            <PriceLineChart data={monthlyAnalysis} xKey="month" />
          )}
        </Card>
        <Card title="Market Cap Distribution">
          {loading ? (
            <TableSkeleton rows={4} cols={1} />
          ) : (
            <MarketCapPieChart data={marketCapData} />
          )}
        </Card>
      </div>

      {/* Quick Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Top 5 by Market Cap">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <Table columns={coinColumns} data={topMarketCap} />
          )}
        </Card>
        <Card title="Top 5 Trending">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <Table columns={coinColumns} data={trending} />
          )}
        </Card>
        <Card title="High Volatility Alerts">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <Table
              columns={[
                ...coinColumns.slice(0, 3),
                {
                  key: 'volatility',
                  label: 'Volatility',
                  render: (r) => r.volatility ?? r.volatilityIndex ?? '—',
                },
              ]}
              data={volatilityAlerts}
            />
          )}
        </Card>
      </div>
    </div>
  );
}