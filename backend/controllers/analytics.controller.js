const asyncHandler = require('../utils/asyncHandler');
const analyticsService = require('../services/analytics.service');

const ok = (res, message, data, pagination = {}) => {
  res.status(200).json({ success: true, message, data, pagination });
};

exports.priceHighest = asyncHandler(async (req, res) => {
  const data = await analyticsService.highestPriceCoin();
  ok(res, 'Highest priced record', data, {});
});

exports.priceLowest = asyncHandler(async (req, res) => {
  const data = await analyticsService.lowestPriceCoin();
  ok(res, 'Lowest priced record', data, {});
});

exports.priceAverage = asyncHandler(async (req, res) => {
  const data = await analyticsService.averagePrice();
  ok(res, 'Average price', data, {});
});

exports.priceHistory = asyncHandler(async (req, res) => {
  const result = await analyticsService.priceHistory(req.params.coinId, req.query.page, req.query.limit);
  ok(res, 'Price history', result.items, result.pagination);
});

exports.priceTrend = asyncHandler(async (req, res) => {
  const data = await analyticsService.priceTrend();
  ok(res, 'Price trend', data, {});
});

exports.priceGrowth = asyncHandler(async (req, res) => {
  const result = await analyticsService.priceGrowth();
  ok(res, 'Price growth sample', result.items, result.pagination);
});