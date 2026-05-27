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