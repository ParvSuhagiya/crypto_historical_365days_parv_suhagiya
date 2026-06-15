import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar } from '../../features/ui/uiSlice';
import useAuth from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div>
          <p className="text-sm font-medium text-slate-900">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user?.role === 'admin' && (
          <span className="hidden rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 sm:inline">
            Admin
          </span>
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
