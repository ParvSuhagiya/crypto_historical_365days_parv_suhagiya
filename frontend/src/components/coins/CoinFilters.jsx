import { COIN_FILTER_OPTIONS, COIN_SORT_OPTIONS } from '../../utils/constants';

export default function CoinFilters({ filter, sort, onFilterChange, onSortChange, search, onSearchChange }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <input
        type="text"
        placeholder="Search coins..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 lg:max-w-xs"
      />
      <select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
      >
        {COIN_FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
      >
        {COIN_SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
