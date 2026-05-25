const Coin = require('../models/Coin.model');
const { buildPagination } = require('../utils/pagination');

const notDeleted = { isDeleted: false };

const highestPriceCoin = async () => {
  try {
    const doc = await Coin.findOne(notDeleted).sort({ price: -1 }).lean();
    if (!doc) {
      const e = new Error('No data');
      e.statusCode = 404;
      throw e;
    }
    return doc;
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const lowestPriceCoin = async () => {
  try {
    const doc = await Coin.findOne(notDeleted).sort({ price: 1 }).lean();
    if (!doc) {
      const e = new Error('No data');
      e.statusCode = 404;
      throw e;
    }
    return doc;
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const averagePrice = async () => {
  try {
    const [r] = await Coin.aggregate([{ $match: notDeleted }, { $group: { _id: null, avg: { $avg: '$price' } } }]);
    return { averagePrice: r?.avg ?? 0 };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const priceHistory = async (coinId, page, limit) => {
  try {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(200, Math.max(1, Number(limit) || 50));
    const skip = (p - 1) * l;
    const filter = { ...notDeleted, coinId: String(coinId) };
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ timestamp: 1 }).select('date price timestamp').skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    if (total === 0) {
      const e = new Error('No price history for this coinId');
      e.statusCode = 404;
      throw e;
    }
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const priceTrend = async () => {
  try {
    const [r] = await Coin.aggregate([
      { $match: notDeleted },
      { $sort: { timestamp: -1 } },
      { $limit: 400 },
      { $group: { _id: null, avgDaily: { $avg: '$dailyReturn' } } },
    ]);
    return { recentAvgDailyReturn: r?.avgDaily ?? 0, interpretation: 'Based on latest 400 records' };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const priceGrowth = async () => {
  try {
    const items = await Coin.find({ ...notDeleted, dailyReturn: { $gt: 0 } })
      .sort({ dailyReturn: -1 })
      .limit(15)
      .lean();
    return { items, pagination: buildPagination(items.length, 1, 15) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};