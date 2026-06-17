import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/adminAPI';
import { coinAPI } from '../../api/coinAPI';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { StatCardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { formatCurrency, formatNumber, extractArray } from '../../utils/formatters';
import { APP_NAME } from '../../utils/constants';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [coins, setCoins] = useState([]);
  const [bulkJson, setBulkJson] = useState('[{"name":"Example","symbol":"EX","rank":1,"price":100}]');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, coinsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getCoins({ limit: 10 }),
      ]);
      setStats(statsRes.data?.data || statsRes.data);
      setUsers(extractArray(usersRes.data?.data || usersRes.data));
      setCoins(extractArray(coinsRes.data?.data || coinsRes.data));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load admin data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBulkCreate = async () => {
    setActionLoading(true);
    try {
      const payload = JSON.parse(bulkJson);
      await coinAPI.bulkCreate(Array.isArray(payload) ? payload : [payload]);
      toast.success('Bulk create successful');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Bulk create failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    setActionLoading(true);
    try {
      const payload = JSON.parse(bulkJson);
      await coinAPI.bulkUpdate(Array.isArray(payload) ? payload : [payload]);
      toast.success('Bulk update successful');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Bulk update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setActionLoading(true);
    try {
      const payload = JSON.parse(bulkJson);
      await coinAPI.bulkDelete(Array.isArray(payload) ? payload : [payload]);
      toast.success('Bulk delete successful');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Bulk delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearCache = async () => {
    setActionLoading(true);
    try {
      await coinAPI.clearCache();
      toast.success('Cache cleared successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear cache');
    } finally {
      setActionLoading(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const statEntries = stats && typeof stats === 'object'
    ? Object.entries(stats).slice(0, 4)
    : [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Admin Dashboard | {APP_NAME}</title>
      </Helmet>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">System overview and bulk operations</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statEntries.map(([key, val]) => (
              <Card key={key}>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {key.replace(/([A-Z])/g, ' $1')}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {typeof val === 'number'
                    ? key.toLowerCase().includes('price') || key.toLowerCase().includes('cap')
                      ? formatCurrency(val)
                      : formatNumber(val)
                    : String(val)}
                </p>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Users">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <Table
              columns={[
                { key: 'name', label: 'Name', render: (r) => r.name },
                { key: 'email', label: 'Email', render: (r) => r.email },
                { key: 'role', label: 'Role', render: (r) => r.role },
              ]}
              data={users.slice(0, 10)}
            />
          )}
        </Card>
        <Card title="Admin Coins">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <Table
              columns={[
                { key: 'name', label: 'Name', render: (r) => r.name },
                { key: 'symbol', label: 'Symbol', render: (r) => r.symbol },
                { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
              ]}
              data={coins}
            />
          )}
        </Card>
      </div>

      <Card title="Bulk Operations">
        <textarea
          value={bulkJson}
          onChange={(e) => setBulkJson(e.target.value)}
          rows={6}
          className="mb-4 w-full rounded-lg border border-slate-200 p-3 font-mono text-xs outline-none focus:border-blue-500"
        />
        <div className="flex flex-wrap gap-3">
          <Button loading={actionLoading} onClick={handleBulkCreate}>
            Bulk Create
          </Button>
          <Button variant="secondary" loading={actionLoading} onClick={handleBulkUpdate}>
            Bulk Update
          </Button>
          <Button variant="danger" loading={actionLoading} onClick={handleBulkDelete}>
            Bulk Delete
          </Button>
          <Button variant="ghost" loading={actionLoading} onClick={handleClearCache}>
            Clear Cache
          </Button>
        </div>
      </Card>
    </div>
  );
}
