const Coin = require('../models/Coin.model');
const { buildPagination } = require('../utils/pagination');

const notDeleted = { isDeleted: false };

const totalMarketCap = async () => {
  try {
    const [r] = await Coin.aggregate([{ $match: notDeleted }, { $group: { _id: null, total: { $sum: '$marketCap' } } }]);
    return { totalMarketCap: r?.total ?? 0 };
  } catch (err) {
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

const averageVolume = async () => {
  try {
    const [r] = await Coin.aggregate([{ $match: notDeleted }, { $group: { _id: null, avg: { $avg: '$volume' } } }]);
    return { averageVolume: r?.avg ?? 0 };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const highestMarketCapCoin = async () => {
  try {
    const doc = await Coin.findOne(notDeleted).sort({ marketCap: -1 }).lean();
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

const highestVolumeCoin = async () => {
  try {
    const doc = await Coin.findOne(notDeleted).sort({ volume: -1 }).lean();
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

const topGainers = async (limit) => {
  try {
    const l = Math.min(50, Math.max(1, Number(limit) || 10));
    const items = await Coin.find(notDeleted).sort({ dailyReturn: -1 }).limit(l).lean();
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const topLosers = async (limit) => {
  try {
    const l = Math.min(50, Math.max(1, Number(limit) || 10));
    const items = await Coin.find(notDeleted).sort({ dailyReturn: 1 }).limit(l).lean();
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const monthlyAnalysis = async () => {
  try {
    const items = await Coin.aggregate([
      { $match: notDeleted },
      {
        $group: {
          _id: '$month',
          avgPrice: { $avg: '$price' },
          totalVolume: { $sum: '$volume' },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, month: '$_id', avgPrice: 1, totalVolume: 1, count: 1 } },
      { $sort: { month: 1 } },
    ]);
    return { items };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const coinCount = async () => {
  try {
    const unique = await Coin.distinct('coinId', notDeleted);
    return { uniqueCoinCount: unique.length, totalRecords: await Coin.countDocuments(notDeleted) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const rankDistribution = async () => {
  try {
    const items = await Coin.aggregate([
      { $match: notDeleted },
      {
        $addFields: {
          range: {
            $switch: {
              branches: [
                { case: { $lte: ['$rank', 10] }, then: 'top_10' },
                { case: { $lte: ['$rank', 50] }, then: '11_50' },
                { case: { $lte: ['$rank', 100] }, then: '51_100' },
              ],
              default: '100_plus',
            },
          },
        },
      },
      { $group: { _id: '$range', count: { $sum: 1 } } },
      { $project: { _id: 0, range: '$_id', count: 1 } },
      { $sort: { range: 1 } },
    ]);
    return { items };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const priceDistribution = async () => {
  try {
    const items = await Coin.aggregate([
      { $match: notDeleted },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 100, 1000, 10000, 1e15],
          default: 'other',
          output: { count: { $sum: 1 } },
        },
      },
      {
        $project: {
          _id: 0,
          bucket: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: '0_100' },
                { case: { $eq: ['$_id', 100] }, then: '100_1000' },
                { case: { $eq: ['$_id', 1000] }, then: '1000_10000' },
              ],
              default: '10000_plus',
            },
          },
          count: 1,
        },
      },
    ]);
    return { items };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const volatilityDistribution = async () => {
  try {
    const [low] = await Coin.aggregate([
      { $match: { ...notDeleted, volatility: { $lte: 5 } } },
      { $count: 'c' },
    ]);
    const [med] = await Coin.aggregate([
      { $match: { ...notDeleted, volatility: { $gt: 5, $lte: 20 } } },
      { $count: 'c' },
    ]);
    const [high] = await Coin.aggregate([
      { $match: { ...notDeleted, volatility: { $gt: 20 } } },
      { $count: 'c' },
    ]);
    return {
      items: [
        { bucket: 'low', max: 5, count: low?.c ?? 0 },
        { bucket: 'medium', min: 5, max: 20, count: med?.c ?? 0 },
        { bucket: 'high', min: 20, count: high?.c ?? 0 },
      ],
    };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const marketSummary = async () => {
  try {
    const items = await Coin.aggregate([
      { $match: notDeleted },
      {
        $group: {
          _id: '$name',
          avgPrice: { $avg: '$price' },
          totalVolume: { $sum: '$volume' },
          avgMarketCap: { $avg: '$marketCap' },
        },
      },
      { $project: { _id: 0, name: '$_id', avgPrice: 1, totalVolume: 1, avgMarketCap: 1 } },
      { $sort: { totalVolume: -1 } },
      { $limit: 100 },
    ]);
    return { items };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const dailyAnalysis = async () => {
  try {
    const items = await Coin.aggregate([
      { $match: notDeleted },
      {
        $group: {
          _id: '$date',
          avgPrice: { $avg: '$price' },
          avgReturn: { $avg: '$dailyReturn' },
          totalVolume: { $sum: '$volume' },
        },
      },
      { $project: { _id: 0, date: '$_id', avgPrice: 1, avgReturn: 1, totalVolume: 1 } },
      { $sort: { date: 1 } },
      { $limit: 400 },
    ]);
    return { items };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const yearlyAnalysis = async () => {
  try {
    const items = await Coin.aggregate([
      { $match: notDeleted },
      { $addFields: { year: { $substr: ['$date', 0, 4] } } },
      {
        $group: {
          _id: '$year',
          avgPrice: { $avg: '$price' },
          totalVolume: { $sum: '$volume' },
        },
      },
      { $project: { _id: 0, year: '$_id', avgPrice: 1, totalVolume: 1 } },
      { $sort: { year: 1 } },
    ]);
    return { items };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const adminStatsDashboard = async () => {
  try {
    const [summary, monthly] = await Promise.all([marketSummary(), monthlyAnalysis()]);
    return { marketSummaryTop: summary.items.slice(0, 20), monthlyTrendSample: monthly.items.slice(-12) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

module.exports = {
  totalMarketCap,
  averagePrice,
  averageVolume,
  highestMarketCapCoin,
  highestVolumeCoin,
  topGainers,
  topLosers,
  monthlyAnalysis,
  coinCount,
  rankDistribution,
  priceDistribution,
  volatilityDistribution,
  marketSummary,
  dailyAnalysis,
  yearlyAnalysis,
  adminStatsDashboard,
};
