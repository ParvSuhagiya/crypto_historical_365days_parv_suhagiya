import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../features/ui/uiSlice';
import useAuth from '../../hooks/useAuth';
import { APP_NAME } from '../../utils/constants';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: '🏠' },
  { to: '/dashboard/coins', label: 'Coins', icon: '🪙' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: '📊' },
  { to: '/dashboard/stats', label: 'Statistics', icon: '📈' },
  { to: '/dashboard/search', label: 'Search', icon: '🔍' },
  { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
];

const adminItems = [
  { to: '/admin', label: 'Admin Panel', icon: '🛡️' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const { isAdmin } = useAuth();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-slate-900 shadow-lg transition-transform md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <span className="text-lg font-bold text-white">{APP_NAME}</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-l-4 border-blue-500 bg-blue-600/10 text-blue-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="my-4 border-t border-slate-800 pt-4">
                <p className="px-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Admin Only
                </p>
              </div>
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-l-4 border-blue-500 bg-blue-600/10 text-blue-400'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    )
                  }
                >
                  <span>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
