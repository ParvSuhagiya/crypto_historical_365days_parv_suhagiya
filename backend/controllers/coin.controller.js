const asyncHandler = require('../utils/asyncHandler');
const coinService = require('../services/coin.service');

const ok = (res, message, data, pagination = {}, status = 200) => {
  res.status(status).json({ success: true, message, data, pagination });
};

exports.getAllCoins = asyncHandler(async (req, res) => {
  const result = await coinService.getAllCoins(req.query);
  ok(res, 'Coins fetched successfully', result.items, result.pagination);
});

exports.getCoinById = asyncHandler(async (req, res) => {
  const data = await coinService.getCoinByMongoId(req.params.id);
  ok(res, 'Coin fetched successfully', data, {});
});

exports.createCoin = asyncHandler(async (req, res) => {
  const data = await coinService.createCoin(req.body);
  ok(res, 'Coin created successfully', data, {}, 201);
});

exports.replaceCoin = asyncHandler(async (req, res) => {
  const data = await coinService.replaceCoin(req.params.id, req.body);
  ok(res, 'Coin updated successfully', data, {});
});

exports.patchCoin = asyncHandler(async (req, res) => {
  const data = await coinService.patchCoin(req.params.id, req.body);
  ok(res, 'Coin patched successfully', data, {});
});

exports.deleteCoin = asyncHandler(async (req, res) => {
  const data = await coinService.softDeleteCoin(req.params.id);
  ok(res, 'Coin soft-deleted successfully', data, {});
});

exports.checkExists = asyncHandler(async (req, res) => {
  const data = await coinService.coinExists(req.params.id);
  ok(res, 'Existence checked', data, {});
});

exports.bulkCreate = asyncHandler(async (req, res) => {
  const data = await coinService.bulkCreateCoins(req.body);
  ok(res, 'Bulk create completed', data, {});
});

exports.bulkUpdate = asyncHandler(async (req, res) => {
  const data = await coinService.bulkUpdateCoins(req.body);
  ok(res, 'Bulk update completed', data, {});
});

exports.bulkDelete = asyncHandler(async (req, res) => {
  const data = await coinService.bulkDeleteCoins(req.body);
  ok(res, 'Bulk soft-delete completed', data, {});
});

exports.getByName = asyncHandler(async (req, res) => {
  const result = await coinService.getByName(req.params.coinName, req.query.page, req.query.limit);
  ok(res, 'Coins by name', result.items, result.pagination);
});

exports.getBySymbol = asyncHandler(async (req, res) => {
  const result = await coinService.getBySymbol(req.params.symbol, req.query.page, req.query.limit);
  ok(res, 'Coins by symbol', result.items, result.pagination);
});

exports.getByRank = asyncHandler(async (req, res) => {
  const result = await coinService.getByRank(req.params.rank, req.query.page, req.query.limit);
  ok(res, 'Coins by rank', result.items, result.pagination);
});

exports.getByMonth = asyncHandler(async (req, res) => {
  const result = await coinService.getByMonth(req.params.month, req.query.page, req.query.limit);
  ok(res, 'Coins for month', result.items, result.pagination);
});

exports.getByDate = asyncHandler(async (req, res) => {
  const result = await coinService.getByDate(req.params.date, req.query.page, req.query.limit);
  ok(res, 'Coins for date', result.items, result.pagination);
});

exports.getLatest = asyncHandler(async (req, res) => {
  const result = await coinService.getLatest(req.query.limit);
  ok(res, 'Latest coins', result.items, result.pagination);
});

exports.getHistory = asyncHandler(async (req, res) => {
  const result = await coinService.getHistoryByCoinId(req.params.coinId, req.query.page, req.query.limit);
  ok(res, 'Coin history', result.items, result.pagination);
});

exports.getHistoryMonth = asyncHandler(async (req, res) => {
  const result = await coinService.getHistoryByCoinIdAndMonth(
    req.params.coinId,
    req.params.month,
    req.query.page,
    req.query.limit
  );
  ok(res, 'Monthly coin history', result.items, result.pagination);
});

exports.topMarketCap = asyncHandler(async (req, res) => {
  const result = await coinService.topByField('marketCap', -1, req.query.limit);
  ok(res, 'Top market cap', result.items, result.pagination);
});

exports.topVolume = asyncHandler(async (req, res) => {
  const result = await coinService.topByField('volume', -1, req.query.limit);
  ok(res, 'Top volume', result.items, result.pagination);
});

exports.topGainers = asyncHandler(async (req, res) => {
  const result = await coinService.topByField('dailyReturn', -1, req.query.limit);
  ok(res, 'Top gainers', result.items, result.pagination);
});

exports.topLosers = asyncHandler(async (req, res) => {
  const result = await coinService.topByField('dailyReturn', 1, req.query.limit);
  ok(res, 'Top losers', result.items, result.pagination);
});

exports.getOldest = asyncHandler(async (req, res) => {
  const result = await coinService.getOldest(req.query.limit);
  ok(res, 'Oldest records', result.items, result.pagination);
});

exports.getNewest = asyncHandler(async (req, res) => {
  const result = await coinService.getNewest(req.query.limit);
  ok(res, 'Newest records', result.items, result.pagination);
});

exports.getTrending = asyncHandler(async (req, res) => {
  const result = await coinService.getTrending(req.query.limit);
  ok(res, 'Trending coins', result.items, result.pagination);
});

exports.getRecent = asyncHandler(async (req, res) => {
  const result = await coinService.getRecentUpdates(req.query.limit);
  ok(res, 'Recently updated', result.items, result.pagination);
});

exports.getRandom = asyncHandler(async (req, res) => {
  const data = await coinService.getRandomCoin();
  ok(res, 'Random coin', data, {});
});

exports.performance = asyncHandler(async (req, res) => {
  const data = await coinService.performanceAnalytics(req.params.coinId);
  ok(res, 'Performance analytics', data, {});
});

exports.volatility = asyncHandler(async (req, res) => {
  const data = await coinService.volatilityAnalytics(req.params.coinId);
  ok(res, 'Volatility analytics', data, {});
});

exports.marketCapCoin = asyncHandler(async (req, res) => {
  const data = await coinService.marketCapDetails(req.params.coinId);
  ok(res, 'Market cap details', data, {});
});

exports.volumeCoin = asyncHandler(async (req, res) => {
  const data = await coinService.volumeDetails(req.params.coinId);
  ok(res, 'Volume details', data, {});
});

exports.returnsCoin = asyncHandler(async (req, res) => {
  const data = await coinService.returnsAnalytics(req.params.coinId);
  ok(res, 'Returns analytics', data, {});
});

exports.priceCoin = asyncHandler(async (req, res) => {
  const data = await coinService.currentPrice(req.params.coinId);
  ok(res, 'Current price', data, {});
});

exports.compareTwo = asyncHandler(async (req, res) => {
  const data = await coinService.compareCoins([req.params.coin1, req.params.coin2]);
  ok(res, 'Comparison', data, {});
});

exports.compareThree = asyncHandler(async (req, res) => {
  const data = await coinService.compareCoins([req.params.coin1, req.params.coin2, req.params.coin3]);
  ok(res, 'Comparison', data, {});
});

exports.sortPriceAsc = asyncHandler(async (req, res) => {
  const result = await coinService.sortSimple({ price: 1 }, req.query.page, req.query.limit);
  ok(res, 'Sorted by price asc', result.items, result.pagination);
});