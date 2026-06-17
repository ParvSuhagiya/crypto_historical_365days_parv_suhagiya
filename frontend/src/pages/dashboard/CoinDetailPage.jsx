import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { coinAPI } from '../../api/coinAPI';
import { analyticsAPI } from '../../api/analyticsAPI';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { StatCardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import PriceLineChart from '../../components/charts/PriceLineChart';
import Table from '../../components/ui/Table';
import {
  formatCurrency,
  formatPercent,
  getReturnColor,
  extractArray,
} from '../../utils/formatters';
import { APP_NAME } from '../../utils/constants';

export default function CoinDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coin, setCoin] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [volatility, setVolatility] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareIds, setCompareIds] = useState({ coin2: '', coin3: '' });
  const [compareResult, setCompareResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coinRes, historyRes, perfRes, volRes] = await Promise.all([
        coinAPI.getById(id),
        analyticsAPI.priceHistory(id),
        coinAPI.performance(id),
        coinAPI.volatility(id),
      ]);
      setCoin(coinRes.data?.data || coinRes.data);
      setPriceHistory(historyRes.data?.data || historyRes.data);
      setPerformance(perfRes.data?.data || perfRes.data);
      setVolatility(volRes.data?.data || volRes.data);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load coin details';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCompare = async () => {
    if (!compareIds.coin2) {
      toast.error('Please enter a second coin ID');
      return;
    }
    setCompareLoading(true);
    try {
      const { data } = compareIds.coin3
        ? await coinAPI.compare(id, compareIds.coin2, compareIds.coin3)
        : await coinAPI.compare(id, compareIds.coin2);
      setCompareResult(data?.data || data);
      toast.success('Comparison loaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Comparison failed');
    } finally {
      setCompareLoading(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const returnVal = coin?.return24h ?? coin?.return;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{coin?.name || 'Coin'} | {APP_NAME}</title>
      </Helmet>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/dashboard/coins" className="text-sm text-blue-600 hover:underline">
            ← Back to Coins
          </Link>
          {loading ? (
            <div className="mt-2 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          ) : (
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{coin?.name}</h1>
              <Badge variant="info">{coin?.symbol?.toUpperCase()}</Badge>
              <Badge variant="neutral">Rank #{coin?.rank ?? '—'}</Badge>
            </div>
          )}
        </div>
        <Button variant="secondary" onClick={() => setCompareOpen(true)}>
          Compare Coins
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current Price</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(coin?.price)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Market Cap</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(coin?.marketCap)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Volume</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(coin?.volume)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">24h Return</p>
              <p className={`mt-2 text-3xl font-bold ${getReturnColor(returnVal)}`}>
                {formatPercent(returnVal)}
              </p>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Price History">
          {loading ? <TableSkeleton rows={4} /> : <PriceLineChart data={priceHistory} />}
        </Card>
        <Card title="Performance Data">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : (
            <div className="space-y-2 text-sm text-slate-600">
              {performance && typeof performance === 'object' ? (
                Object.entries(performance).map(([key, val]) => (
                  <div key={key} className="flex justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <span className="capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium text-slate-900">
                      {typeof val === 'number' ? (key.toLowerCase().includes('return') ? formatPercent(val) : formatCurrency(val)) : String(val)}
                    </span>
                  </div>
                ))
              ) : (
                <p>No performance data available</p>
              )}
            </div>
          )}
        </Card>
      </div>

      <Card title="Volatility Data">
        {loading ? (
          <TableSkeleton rows={3} />
        ) : Array.isArray(volatility) || extractArray(volatility).length ? (
          <Table
            columns={[
              { key: 'label', label: 'Metric', render: (r) => r.label || r.name || r.period },
              { key: 'value', label: 'Value', render: (r) => r.volatility ?? r.value ?? '—' },
            ]}
            data={extractArray(volatility)}
          />
        ) : (
          <div className="space-y-2 text-sm text-slate-600">
            {volatility && typeof volatility === 'object' ? (
              Object.entries(volatility).map(([key, val]) => (
                <div key={key} className="flex justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <span className="capitalize text-slate-500">{key}</span>
                  <span className="font-medium text-slate-900">{String(val)}</span>
                </div>
              ))
            ) : (
              <p>No volatility data available</p>
            )}
          </div>
        )}
      </Card>

      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} title="Compare Coins" size="lg">
        <div className="space-y-4">
          <Input label="Coin 1 (Current)" value={coin?.name || id} disabled />
          <Input
            label="Coin 2 ID"
            value={compareIds.coin2}
            onChange={(e) => setCompareIds({ ...compareIds, coin2: e.target.value })}
            placeholder="Enter coin ID"
          />
          <Input
            label="Coin 3 ID (Optional)"
            value={compareIds.coin3}
            onChange={(e) => setCompareIds({ ...compareIds, coin3: e.target.value })}
            placeholder="Enter coin ID"
          />
          <Button loading={compareLoading} onClick={handleCompare}>
            Compare
          </Button>
          {compareResult && (
            <pre className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              {JSON.stringify(compareResult, null, 2)}
            </pre>
          )}
        </div>
      </Modal>
    </div>
  );
}
