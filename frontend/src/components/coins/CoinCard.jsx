import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatCurrency, formatPercent, getReturnColor } from '../../utils/formatters';

export default function CoinCard({ coin }) {
  const returnVal = coin.return24h ?? coin.return;

  return (
    <Card className="transition hover:border-blue-200">
      <div className="flex items-start justify-between">
        <div>
          <Link to={`/dashboard/coins/${coin._id}`} className="text-base font-semibold text-slate-900 hover:text-blue-600">
            {coin.name}
          </Link>
          <p className="text-xs uppercase text-slate-500">{coin.symbol}</p>
        </div>
        <Badge variant="info">#{coin.rank ?? '—'}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Price</p>
          <p className="text-sm font-semibold text-slate-900">{formatCurrency(coin.price)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">24h</p>
          <p className={`text-sm font-semibold ${getReturnColor(returnVal)}`}>{formatPercent(returnVal)}</p>
        </div>
      </div>
    </Card>
  );
}
