import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { searchAPI } from '../../api/searchAPI';
import Table from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import Button from '../../components/ui/Button';
import usePagination from '../../hooks/usePagination';
import { SEARCH_FIELD_OPTIONS, APP_NAME } from '../../utils/constants';
import { formatCurrency, formatPercent, getReturnColor } from '../../utils/formatters';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('name');
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { page, limit, goToPage, changeLimit } = usePagination(1, 10);

  const search = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await searchAPI.searchCoins({ q: query, field, page, limit });
      setResults(data?.data || data?.results || []);
      setPagination(data?.pagination || { page, pages: 1, total: results.length });
    } catch (err) {
      const message = err.response?.data?.message || 'Search failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      search();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, field, page, limit]);

  const columns = [
    { key: 'rank', label: 'Rank', render: (r) => r.rank ?? '—' },
    { key: 'name', label: 'Name', render: (r) => r.name },
    { key: 'symbol', label: 'Symbol', render: (r) => r.symbol?.toUpperCase() },
    { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
    {
      key: 'return',
      label: '24h Return',
      render: (r) => (
        <span className={getReturnColor(r.return24h ?? r.return)}>
          {formatPercent(r.return24h ?? r.return)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Search | {APP_NAME}</title>
      </Helmet>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Search</h1>
        <p className="text-sm text-slate-600">Find coins by name, symbol, or rank</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search coins..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            goToPage(1);
          }}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          {SEARCH_FIELD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Search by {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorState message={error} onRetry={search} />}

      {loading ? (
        <TableSkeleton rows={8} />
      ) : !query.trim() ? (
        <EmptyState title="Start searching" description="Enter a query to search the coin database." />
      ) : !results.length ? (
        <EmptyState title="No results found" description={`No coins match "${query}"`} />
      ) : (
        <>
          <Table columns={columns} data={results} />
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-600">
              {pagination.total || results.length} results · Page {pagination.page || page}
            </p>
            <div className="flex items-center gap-3">
              <select
                value={limit}
                onChange={(e) => changeLimit(Number(e.target.value))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= (pagination.pages || 1)}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
