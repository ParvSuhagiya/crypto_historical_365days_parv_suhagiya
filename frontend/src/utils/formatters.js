export const formatCurrency = (value, currency = 'USD') => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(Number(value));
};

export const formatNumber = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-US').format(Number(value));
};

export const formatCompact = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(Number(value));
};

export const formatPercent = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const num = Number(value);
  const prefix = num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(2)}%`;
};

export const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
};

export const getReturnColor = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 'text-slate-600';
  if (num > 0) return 'text-emerald-600';
  if (num < 0) return 'text-red-600';
  return 'text-slate-600';
};

export const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.coins)) return payload.coins;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export const extractValue = (payload, keys = []) => {
  if (payload == null) return null;
  if (typeof payload !== 'object') return payload;
  for (const key of keys) {
    if (payload[key] != null) return payload[key];
  }
  if (payload.data != null && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    for (const key of keys) {
      if (payload.data[key] != null) return payload.data[key];
    }
  }
  return payload;
};
