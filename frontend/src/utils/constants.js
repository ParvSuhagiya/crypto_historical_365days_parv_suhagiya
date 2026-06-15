export const APP_NAME = 'Crypto Analytics';

export const COIN_FILTER_OPTIONS = [
  { label: 'All Coins', value: '' },
  { label: 'High Price', value: '/coins/filter/high-price' },
  { label: 'Low Price', value: '/coins/filter/low-price' },
  { label: 'High Volume', value: '/coins/filter/high-volume' },
  { label: 'Low Volume', value: '/coins/filter/low-volume' },
  { label: 'High Market Cap', value: '/coins/filter/high-market-cap' },
  { label: 'Low Market Cap', value: '/coins/filter/low-market-cap' },
  { label: 'High Volatility', value: '/coins/filter/high-volatility' },
  { label: 'Low Volatility', value: '/coins/filter/low-volatility' },
  { label: 'High Return', value: '/coins/filter/high-return' },
  { label: 'Negative Return', value: '/coins/filter/negative-return' },
  { label: 'Bullish', value: '/coins/filter/bullish' },
  { label: 'Bearish', value: '/coins/filter/bearish' },
  { label: 'Profitable', value: '/coins/filter/profitable' },
  { label: 'Loss Making', value: '/coins/filter/loss-making' },
  { label: 'Missing Values', value: '/coins/filter/missing-values' },
];

export const COIN_SORT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Price (Low to High)', value: '/coins/sort/price-asc' },
  { label: 'Price (High to Low)', value: '/coins/sort/price-desc' },
  { label: 'Volume (High to Low)', value: '/coins/sort/volume-desc' },
  { label: 'Rank (Low to High)', value: '/coins/sort/rank-asc' },
  { label: 'Return (High to Low)', value: '/coins/sort/return-desc' },
];

export const SEARCH_FIELD_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Symbol', value: 'symbol' },
  { label: 'Rank', value: 'rank' },
];

export const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const DEFAULT_PAGE_SIZE = 10;
