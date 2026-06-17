import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { formatCurrency, formatPercent, getReturnColor } from '../../utils/formatters';

export default function CoinTable({ coins, onEdit, onDelete, onRowClick }) {
  if (!coins?.length) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {['Rank', 'Name', 'Symbol', 'Price', 'Market Cap', 'Volume', '24h Return', 'Volatility', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {coins.map((coin) => (
              <tr key={coin._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-600">
                  <Badge variant="neutral">#{coin.rank ?? '—'}</Badge>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {onRowClick ? (
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => onRowClick(coin)}
                    >
                      {coin.name}
                    </button>
                  ) : (
                    <Link to={`/dashboard/coins/${coin._id}`} className="text-blue-600 hover:underline">
                      {coin.name}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3 text-sm uppercase text-slate-600">{coin.symbol}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(coin.price)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(coin.marketCap)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(coin.volume)}</td>
                <td className={`px-4 py-3 text-sm font-medium ${getReturnColor(coin.return24h ?? coin.return)}`}>
                  {formatPercent(coin.return24h ?? coin.return)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{coin.volatility ?? '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        className="rounded-lg px-2 py-1 text-blue-600 hover:bg-blue-50"
                        onClick={() => onEdit(coin)}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="rounded-lg px-2 py-1 text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(coin)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
