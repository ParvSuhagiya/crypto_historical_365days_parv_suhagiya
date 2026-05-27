const Coin = require('../models/Coin.model');
const { buildPagination } = require('../utils/pagination');

const searchCoins = async (q, page, limit) => {
  try {
    if (!q || String(q).trim() === '') {
      const e = new Error('Query parameter q is required');
      e.statusCode = 400;
      throw e;
    }
    const term = String(q).trim();
    const regex = new RegExp(escapeRe(term), 'i');
    const filter = {
      isDeleted: false,
      $or: [{ name: regex }, { symbol: regex }, { month: regex }, { coinId: regex }],
    };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ timestamp: -1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { searchCoins };
