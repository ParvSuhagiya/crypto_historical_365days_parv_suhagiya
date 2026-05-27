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

exports.topLosers = asyncHandler(async (req, res) => {
  const result = await statsService.topLosers(req.query.limit);
  ok(res, 'Top losers', result.items, result.pagination);
});

exports.monthlyAnalysis = asyncHandler(async (req, res) => {
  const data = await statsService.monthlyAnalysis();
  ok(res, 'Monthly analysis', data, {});
});

exports.coinCount = asyncHandler(async (req, res) => {
  const data = await statsService.coinCount();
  ok(res, 'Coin counts', data, {});
});

exports.rankDistribution = asyncHandler(async (req, res) => {
  const data = await statsService.rankDistribution();
  ok(res, 'Rank distribution', data, {});
});

exports.priceDistribution = asyncHandler(async (req, res) => {
  const data = await statsService.priceDistribution();
  ok(res, 'Price distribution', data, {});
});

exports.volatilityDistribution = asyncHandler(async (req, res) => {
  const data = await statsService.volatilityDistribution();
  ok(res, 'Volatility distribution', data, {});
});

exports.marketSummary = asyncHandler(async (req, res) => {
  const data = await statsService.marketSummary();
  ok(res, 'Market summary', data, {});
});

exports.dailyAnalysis = asyncHandler(async (req, res) => {
  const data = await statsService.dailyAnalysis();
  ok(res, 'Daily analysis', data, {});
});

exports.yearlyAnalysis = asyncHandler(async (req, res) => {
  const data = await statsService.yearlyAnalysis();
  ok(res, 'Yearly analysis', data, {});
});
