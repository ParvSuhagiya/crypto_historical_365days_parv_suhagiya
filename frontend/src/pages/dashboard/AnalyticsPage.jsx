import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchAnalyticsBundle } from '../../features/stats/statsSlice';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import { StatCardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { formatCurrency, formatCompact, formatPercent, getReturnColor } from '../../utils/formatters';
import { APP_NAME } from '../../utils/constants';

// ─── Single coin stat card ────────────────────────────────────────────────────
function CoinCard({ label, coin, loading }) {
  if (loading) return <StatCardSkeleton />;
  if (!coin?.name) return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-slate-400 text-sm">No data</p>
    </Card>
  );
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(coin.price)}</p>
      <p className="mt-1 text-sm font-medium text-slate-600">
        {coin.name}
        <span className="ml-1 text-slate-400 text-xs">({coin.symbol})</span>
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{coin.date}</p>
    </Card>
  );
}

// ─── Single number stat card ──────────────────────────────────────────────────
function NumberCard({ label, value, prefix = '', suffix = '', loading }) {
  if (loading) return <StatCardSkeleton />;
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value != null
          ? `${prefix}${typeof value === 'number'
              ? value.toLocaleString(undefined, { maximumFractionDigits: 4 })
              : value}${suffix}`
          : '—'}
      </p>
    </Card>
  );
}

// ─── Reusable coin table ──────────────────────────────────────────────────────
function CoinTable({ data, loading, extraCol }) {
  const columns = [
    {
      key: 'name',
      label: 'Coin',
      render: (r) => (
        <span className="font-medium text-slate-800">
          {r.name}
          <span className="ml-1 text-xs text-slate-400">{r.symbol}</span>
        </span>
      ),
    },
    { key: 'price',  label: 'Price',  render: (r) => formatCurrency(r.price) },
    {
      key: 'return',
      label: '24h Return',
      render: (r) => (
        <span className={getReturnColor(r.dailyReturn)}>
          {formatPercent(r.dailyReturn)}
        </span>
      ),
    },
    { key: 'volume', label: 'Volume', render: (r) => formatCompact(r.volume) },
    ...(extraCol ? [extraCol] : []),
  ];

  if (loading) return <TableSkeleton rows={5} />;
  if (!data?.length) return (
    <p className="text-sm text-slate-400 py-6 text-center">No data available</p>
  );
  return <Table columns={columns} data={data} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((s) => s.stats);

  useEffect(() => {
    dispatch(fetchAnalyticsBundle());
  }, [dispatch]);

  if (error) return (
    <ErrorState message={error} onRetry={() => dispatch(fetchAnalyticsBundle())} />
  );

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Analytics | {APP_NAME}</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-600">Deep dive into price, volume, returns, and volatility</p>
      </div>

      {/* ── Price Analytics ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Price Analytics</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <CoinCard   label="Highest Price" coin={analytics?.priceHighest} loading={loading} />
          <CoinCard   label="Lowest Price"  coin={analytics?.priceLowest}  loading={loading} />
          <NumberCard label="Average Price" value={analytics?.priceAverage} prefix="$"      loading={loading} />
        </div>

        {/* Price trend is a single number, show as an info banner */}
        {!loading && analytics?.priceTrend != null && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recent Avg Daily Return
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Based on latest 400 records</p>
              </div>
              <p className={`text-2xl font-bold ${analytics.priceTrend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {analytics.priceTrend >= 0 ? '+' : ''}
                {(analytics.priceTrend * 100).toFixed(4)}%
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Price Growth Coins">
            <CoinTable data={analytics?.priceGrowth} loading={loading} />
          </Card>
          <Card title="Price Drop Coins">
            <CoinTable data={analytics?.priceDrop} loading={loading} />
          </Card>
        </div>
      </section>

      {/* ── Volume Analytics ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Volume Analytics</h2>

        <Card title="Highest Volume Coins">
          <CoinTable
            data={analytics?.volumeHighest}
            loading={loading}
            extraCol={{
              key: 'marketCap',
              label: 'Market Cap',
              render: (r) => formatCompact(r.marketCap),
            }}
          />
        </Card>

        <Card title="Volume Spikes">
          <CoinTable
            data={analytics?.volumeSpike}
            loading={loading}
            extraCol={{
              key: 'marketCap',
              label: 'Market Cap',
              render: (r) => formatCompact(r.marketCap),
            }}
          />
        </Card>
      </section>

      {/* ── Returns Analytics ───────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Returns Analytics</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Top Returns">
            <CoinTable data={analytics?.returnsTop} loading={loading} />
          </Card>
          <Card title="Negative Returns">
            <CoinTable data={analytics?.returnsNegative} loading={loading} />
          </Card>
        </div>

        <Card title="Cumulative Returns Leaders">
          <CoinTable
            data={analytics?.returnsCumulative}
            loading={loading}
            extraCol={{
              key: 'marketCap',
              label: 'Market Cap',
              render: (r) => formatCompact(r.marketCap),
            }}
          />
        </Card>
      </section>

      {/* ── Volatility Analytics ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Volatility Analytics</h2>

        <Card title="High Volatility Coins">
          <CoinTable
            data={analytics?.volatilityHigh}
            loading={loading}
            extraCol={{
              key: 'volatility',
              label: 'Volatility',
              render: (r) =>
                r.volatility != null
                  ? `${Number(r.volatility).toFixed(2)}%`
                  : r.dailyReturn != null
                  ? `${Math.abs(r.dailyReturn).toFixed(2)}%`
                  : '—',
            }}
          />
        </Card>
      </section>
    </div>
  );
}
