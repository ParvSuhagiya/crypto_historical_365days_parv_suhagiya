const asyncHandler = require('../utils/asyncHandler');
const searchService = require('../services/search.service');

const ok = (res, message, data, pagination = {}) => {
  res.status(200).json({ success: true, message, data, pagination });
};

exports.searchCoins = asyncHandler(async (req, res) => {
  const result = await searchService.searchCoins(req.query.q, req.query.page, req.query.limit);
  ok(res, 'Search results', result.items, result.pagination);
});
