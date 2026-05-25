const asyncHandler = require('../utils/asyncHandler');
const coinService = require('../services/coin.service');
const statsService = require('../services/stats.service');
const authService = require('../services/auth.service');

const ok = (res, message, data, pagination = {}) => {
  res.status(200).json({ success: true, message, data, pagination });
};

exports.listCoins = asyncHandler(async (req, res) => {
  const result = await coinService.getAllCoinsForAdmin(req.query.page, req.query.limit);
  ok(res, 'Admin coin list', result.items, result.pagination);
});

exports.dashboardStats = asyncHandler(async (req, res) => {
  const data = await statsService.adminStatsDashboard();
  ok(res, 'Admin dashboard', data, {});
});

exports.listUsers = asyncHandler(async (req, res) => {
  const result = await authService.listUsers(req.query.page, req.query.limit);
  ok(res, 'Users list', result.items, result.pagination);
});
