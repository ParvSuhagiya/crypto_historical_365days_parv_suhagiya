const asyncHandler = require('../utils/asyncHandler');
const statsService = require('../services/stats.service');

const ok = (res, message, data, pagination = {}) => {
  res.status(200).json({ success: true, message, data, pagination });
};

exports.marketCap = asyncHandler(async (req, res) => {
  const data = await statsService.totalMarketCap();
  ok(res, 'Total market cap', data, {});
});

exports.averagePrice = asyncHandler(async (req, res) => {
  const data = await statsService.averagePrice();
  ok(res, 'Average price', data, {});
});

exports.averageVolume = asyncHandler(async (req, res) => {
  const data = await statsService.averageVolume();
  ok(res, 'Average volume', data, {});
});

exports.highestMarketCap = asyncHandler(async (req, res) => {
  const data = await statsService.highestMarketCapCoin();
  ok(res, 'Highest market cap coin', data, {});
});

exports.highestVolume = asyncHandler(async (req, res) => {
  const data = await statsService.highestVolumeCoin();
  ok(res, 'Highest volume coin', data, {});
});

exports.topGainers = asyncHandler(async (req, res) => {
  const result = await statsService.topGainers(req.query.limit);
  ok(res, 'Top gainers', result.items, result.pagination);
});