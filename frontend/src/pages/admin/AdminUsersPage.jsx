import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/adminAPI';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import usePagination from '../../hooks/usePagination';
import { APP_NAME } from '../../utils/constants';
import Badge from '../../components/ui/Badge';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { page, limit, goToPage } = usePagination(1, 20);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminAPI.getUsers({ page, limit });
      setUsers(data?.data || data?.users || []);
      setPagination(data?.pagination || { page, pages: 1, total: 0 });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load users';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, limit]);

  const columns = [
    { key: 'name', label: 'Name', render: (r) => r.name || '—' },
    { key: 'email', label: 'Email', render: (r) => r.email },
    {
      key: 'role',
      label: 'Role',
      render: (r) => (
        <Badge variant={r.role === 'admin' ? 'info' : 'neutral'}>{r.role || 'user'}</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'),
    },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Users | {APP_NAME}</title>
      </Helmet>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-600">Manage platform users</p>
      </div>

      {error && <ErrorState message={error} onRetry={loadUsers} />}

      <Card>
        {loading ? (
          <TableSkeleton rows={10} />
        ) : (
          <Table columns={columns} data={users} emptyMessage="No users found" />
        )}
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {pagination.total} users · Page {pagination.page || page} of {pagination.pages || 1}
        </p>
        <div className="flex gap-2">
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
    </div>
  );
}
