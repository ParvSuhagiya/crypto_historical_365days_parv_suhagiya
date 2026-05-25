const SORT_FIELDS = new Set([
  'price',
  'volume',
  'marketCap',
  'dailyReturn',
  'volatility',
  'cumulativeReturn',
  'timestamp',
  'month',
  'name',
  'rank',
]);

const parseNum = (val) => {
  if (val === undefined || val === null || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

const parseIntSafe = (val) => {
  const n = parseNum(val);
  if (n === undefined) return undefined;
  const i = Math.floor(n);
  return Number.isFinite(i) ? i : undefined;
};

/**
 * Builds MongoDB filter and sort options from query string (GET /coins).
 * @param {Record<string, string|undefined>} query
 */
const buildCoinListQuery = (query) => {
  const filter = { isDeleted: false };

  const price = parseNum(query.price);
  if (price !== undefined) filter.price = price;

  const minPrice = parseNum(query.minPrice);
  const maxPrice = parseNum(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const volume = parseNum(query.volume);
  if (volume !== undefined) filter.volume = volume;

  const rank = parseIntSafe(query.rank);
  if (rank !== undefined) filter.rank = rank;

  if (query.month) filter.month = String(query.month);

  const dailyReturn = parseNum(query.dailyReturn);
  if (dailyReturn !== undefined) filter.dailyReturn = dailyReturn;

  const volatility = parseNum(query.volatility);
  if (volatility !== undefined) filter.volatility = volatility;

  const marketCap = parseNum(query.marketCap);
  if (marketCap !== undefined) filter.marketCap = marketCap;

  if (query.symbol) {
    filter.symbol = { $regex: new RegExp(`^${escapeRegex(String(query.symbol))}$`, 'i') };
  }

  let sortField = query.sort && SORT_FIELDS.has(String(query.sort)) ? String(query.sort) : 'timestamp';
  const order = String(query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;
  const sort = { [sortField]: order };

  const page = parseIntSafe(query.page) || 1;
  const limit = parseIntSafe(query.limit) || 10;

  return { filter, sort, page, limit, sortField, order };
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { buildCoinListQuery, SORT_FIELDS };
