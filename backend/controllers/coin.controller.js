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