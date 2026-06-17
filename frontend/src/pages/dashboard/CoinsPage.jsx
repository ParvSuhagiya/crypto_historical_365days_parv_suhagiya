import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  fetchCoins,
  fetchFilteredCoins,
  fetchSortedCoins,
  createCoin,
  updateCoin,
  deleteCoin,
} from '../../features/coins/coinSlice';
import useCoins from '../../hooks/useCoins';
import usePagination from '../../hooks/usePagination';
import { searchAPI } from '../../api/searchAPI';
import { coinAPI } from '../../api/coinAPI';
import CoinTable from '../../components/coins/CoinTable';
import CoinFilters from '../../components/coins/CoinFilters';
import CoinModal from '../../components/coins/CoinModal';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { APP_NAME } from '../../utils/constants';

export default function CoinsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { coins, pagination, loading, error } = useCoins();
  const { page, limit, goToPage, changeLimit } = usePagination(1, 10);

  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoin, setEditCoin] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCoins = useCallback(() => {
    const params = { page, limit };
    if (sort) {
      dispatch(fetchSortedCoins({ path: sort, params }));
    } else if (filter) {
      dispatch(fetchFilteredCoins({ path: filter, params }));
    } else {
      dispatch(fetchCoins(params));
    }
  }, [dispatch, page, limit, sort, filter]);

  useEffect(() => {
    if (search.trim()) return;
    loadCoins();
  }, [loadCoins, search]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await searchAPI.searchCoins({ q: search, field: 'name', page, limit });
        setSearchResults(data?.data || data?.results || data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Search failed');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page, limit]);

  const displayCoins = searchResults ?? coins;

  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      await dispatch(createCoin(formData)).unwrap();
      toast.success('Coin created successfully');
      setModalOpen(false);
      loadCoins();
    } catch (err) {
      toast.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setActionLoading(true);
    try {
      await dispatch(updateCoin({ id: editCoin._id, data: formData })).unwrap();
      toast.success('Coin updated successfully');
      setEditCoin(null);
      loadCoins();
    } catch (err) {
      toast.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await dispatch(deleteCoin(deleteTarget._id)).unwrap();
      toast.success('Coin deleted successfully');
      setDeleteTarget(null);
      loadCoins();
    } catch (err) {
      toast.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = type === 'csv' ? await coinAPI.exportCsv() : await coinAPI.exportJson();
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `coins-export.${type}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${type.toUpperCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Coins | {APP_NAME}</title>
      </Helmet>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coins</h1>
          <p className="text-sm text-slate-600">Manage and explore cryptocurrency data</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleExport('csv')}>
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('json')}>
            Export JSON
          </Button>
          <Button onClick={() => setModalOpen(true)}>Add Coin</Button>
        </div>
      </div>

      <CoinFilters
        filter={filter}
        sort={sort}
        search={search}
        onSearchChange={setSearch}
        onFilterChange={(val) => {
          setFilter(val);
          goToPage(1);
        }}
        onSortChange={(val) => {
          setSort(val);
          goToPage(1);
        }}
      />

      {error && !loading && <ErrorState message={error} onRetry={loadCoins} />}

      {loading ? (
        <TableSkeleton rows={8} />
      ) : !displayCoins?.length ? (
        <EmptyState title="No coins found" description="Try adjusting your filters or add a new coin." />
      ) : (
        <CoinTable
          coins={displayCoins}
          onEdit={(coin) => setEditCoin(coin)}
          onDelete={(coin) => setDeleteTarget(coin)}
          onRowClick={(coin) => navigate(`/dashboard/coins/${coin._id}`)}
        />
      )}

      {!searchResults && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-600">
            Page {pagination.page || page} of {pagination.pages || 1} · {pagination.total || 0} total
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
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
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
      )}

      <CoinModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        title="Add New Coin"
        loading={actionLoading}
      />

      <CoinModal
        open={!!editCoin}
        onClose={() => setEditCoin(null)}
        onSubmit={handleUpdate}
        initialValues={editCoin}
        title="Edit Coin"
        loading={actionLoading}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Coin"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={actionLoading} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
