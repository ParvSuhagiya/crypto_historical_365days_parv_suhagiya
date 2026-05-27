const mongoose = require('mongoose');
const Coin = require('../models/Coin.model');
const { buildCoinListQuery } = require('../utils/filterBuilder');
const { buildPagination } = require('../utils/pagination');

const MONTH_REGEX = /^\d{4}-\d{2}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const notDeleted = { isDeleted: false };

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const duplicateKeyMessage = (err) =>
  err && err.code === 11000 ? 'Duplicate record (coinId or unique constraint)' : null;

const validateCreateCoin = (body) => {
  const errors = [];
  const required = ['name', 'symbol', 'price', 'marketCap', 'volume', 'rank', 'date', 'month'];
  for (const f of required) {
    if (body[f] === undefined || body[f] === null || body[f] === '') {
      errors.push(`${f} is required`);
    }
  }
  const numFields = ['price', 'marketCap', 'volume', 'rank'];
  for (const f of numFields) {
    const n = Number(body[f]);
    if (body[f] !== undefined && (!Number.isFinite(n) || n <= 0)) {
      errors.push(`${f} must be a positive number`);
    }
  }
  if (body.rank !== undefined) {
    const r = Number(body.rank);
    if (!Number.isInteger(r) || r <= 0) errors.push('rank must be a positive integer');
  }
  if (body.date && !DATE_REGEX.test(String(body.date))) {
    errors.push('date must be YYYY-MM-DD');
  }
  if (body.month && !MONTH_REGEX.test(String(body.month))) {
    errors.push('month must be YYYY-MM');
  }
  return errors;
};

const ensureCoinId = (body) => {
  if (body.coinId) return String(body.coinId);
  const sym = String(body.symbol || '').toLowerCase();
  const d = String(body.date || '');
  return `${sym}-${d}`;
};

const getAllCoins = async (query) => {
  try {
    const { filter, sort, page, limit } = buildCoinListQuery(query);
    const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
    const lim = Math.min(100, Math.max(1, limit));

    const [items, total] = await Promise.all([
      Coin.find(filter).sort(sort).skip(skip).limit(lim).lean(),
      Coin.countDocuments(filter),
    ]);

    return {
      items,
      pagination: buildPagination(total, page, lim),
    };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getCoinByMongoId = async (id) => {
  try {
    if (!isValidObjectId(id)) {
      const e = new Error('Invalid id format');
      e.statusCode = 400;
      throw e;
    }
    const doc = await Coin.findOne({ _id: id, ...notDeleted }).lean();
    if (!doc) {
      const e = new Error('Coin not found');
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

const createCoin = async (body) => {
  try {
    const errs = validateCreateCoin(body);
    if (errs.length) {
      const e = new Error(errs.join('; '));
      e.statusCode = 400;
      throw e;
    }
    const coinId = ensureCoinId(body);
    const ts =
      body.timestamp instanceof Date
        ? body.timestamp
        : body.date
          ? new Date(`${body.date}T00:00:00.000Z`)
          : new Date();

    const doc = await Coin.create({
      coinId,
      name: body.name,
      symbol: body.symbol,
      rank: Number(body.rank),
      date: String(body.date),
      month: String(body.month),
      timestamp: ts,
      price: Number(body.price),
      marketCap: Number(body.marketCap),
      volume: Number(body.volume),
      dailyReturn: body.dailyReturn != null ? Number(body.dailyReturn) : 0,
      cumulativeReturn: body.cumulativeReturn != null ? Number(body.cumulativeReturn) : 0,
      volatility: body.volatility != null ? Number(body.volatility) : 0,
      high: body.high != null ? Number(body.high) : undefined,
      low: body.low != null ? Number(body.low) : undefined,
      isDeleted: false,
    });
    return doc.toObject();
  } catch (err) {
    const dup = duplicateKeyMessage(err);
    if (dup) {
      const e = new Error(dup);
      e.statusCode = 409;
      throw e;
    }
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};


const replaceCoin = async (id, body) => {
  try {
    if (!isValidObjectId(id)) {
      const e = new Error('Invalid id format');
      e.statusCode = 400;
      throw e;
    }
    const existing = await Coin.findOne({ _id: id, ...notDeleted });
    if (!existing) {
      const e = new Error('Coin not found');
      e.statusCode = 404;
      throw e;
    }
    const errs = validateCreateCoin(body);
    if (errs.length) {
      const e = new Error(errs.join('; '));
      e.statusCode = 400;
      throw e;
    }
    Object.assign(existing, {
      coinId: ensureCoinId(body),
      name: body.name,
      symbol: body.symbol,
      rank: Number(body.rank),
      date: String(body.date),
      month: String(body.month),
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(`${body.date}T00:00:00.000Z`),
      price: Number(body.price),
      marketCap: Number(body.marketCap),
      volume: Number(body.volume),
      dailyReturn: Number(body.dailyReturn ?? 0),
      cumulativeReturn: Number(body.cumulativeReturn ?? 0),
      volatility: Number(body.volatility ?? 0),
      high: body.high,
      low: body.low,
    });
    await existing.save();
    return existing.toObject();
  } catch (err) {
    const dup = duplicateKeyMessage(err);
    if (dup) {
      const e = new Error(dup);
      e.statusCode = 409;
      throw e;
    }
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const patchCoin = async (id, body) => {
  try {
    if (!isValidObjectId(id)) {
      const e = new Error('Invalid id format');
      e.statusCode = 400;
      throw e;
    }
    const doc = await Coin.findOneAndUpdate(
      { _id: id, ...notDeleted },
      { $set: body },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) {
      const e = new Error('Coin not found');
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

const softDeleteCoin = async (id) => {
  try {
    if (!isValidObjectId(id)) {
      const e = new Error('Invalid id format');
      e.statusCode = 400;
      throw e;
    }
    const doc = await Coin.findOneAndUpdate(
      { _id: id, ...notDeleted },
      { $set: { isDeleted: true } },
      { new: true }
    ).lean();
    if (!doc) {
      const e = new Error('Coin not found');
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

const coinExists = async (id) => {
  try {
    if (!isValidObjectId(id)) return { exists: false };
    const count = await Coin.countDocuments({ _id: id, ...notDeleted });
    return { exists: count > 0 };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const bulkCreateCoins = async (items) => {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      const e = new Error('Request body must be a non-empty array of coins');
      e.statusCode = 400;
      throw e;
    }
    const prepared = [];
    for (const body of items) {
      const errs = validateCreateCoin(body);
      if (errs.length) {
        const e = new Error(`Validation failed: ${errs.join('; ')}`);
        e.statusCode = 400;
        throw e;
      }
      prepared.push({
        coinId: ensureCoinId(body),
        name: body.name,
        symbol: body.symbol,
        rank: Number(body.rank),
        date: String(body.date),
        month: String(body.month),
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(`${body.date}T00:00:00.000Z`),
        price: Number(body.price),
        marketCap: Number(body.marketCap),
        volume: Number(body.volume),
        dailyReturn: Number(body.dailyReturn ?? 0),
        cumulativeReturn: Number(body.cumulativeReturn ?? 0),
        volatility: Number(body.volatility ?? 0),
        high: body.high,
        low: body.low,
        isDeleted: false,
      });
    }
    const inserted = await Coin.insertMany(prepared, { ordered: false }).catch((err) => {
      if (err.code === 11000) {
        const e = new Error('One or more records violate unique constraints');
        e.statusCode = 409;
        throw e;
      }
      throw err;
    });
    return { count: inserted.length, inserted };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};


const bulkUpdateCoins = async (updates) => {
  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      const e = new Error('Request body must be a non-empty array of { id, data }');
      e.statusCode = 400;
      throw e;
    }
    let modified = 0;
    for (const row of updates) {
      if (!row.id || !row.data) {
        const e = new Error('Each item must have id and data');
        e.statusCode = 400;
        throw e;
      }
      if (!isValidObjectId(row.id)) {
        const e = new Error('Invalid id in bulk update');
        e.statusCode = 400;
        throw e;
      }
      const r = await Coin.updateOne({ _id: row.id, ...notDeleted }, { $set: row.data });
      modified += r.modifiedCount;
    }
    return { modifiedCount: modified };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const bulkDeleteCoins = async (ids) => {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      const e = new Error('Request body must be a non-empty array of ids');
      e.statusCode = 400;
      throw e;
    }
    const valid = ids.filter((id) => isValidObjectId(id));
    const r = await Coin.updateMany({ _id: { $in: valid }, ...notDeleted }, { $set: { isDeleted: true } });
    return { modifiedCount: r.modifiedCount };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getByName = async (coinName, page, limit) => {
  try {
    const filter = { ...notDeleted, name: { $regex: new RegExp(`^${escapeRe(coinName)}$`, 'i') } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ timestamp: -1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getBySymbol = async (symbol, page, limit) => {
  try {
    const filter = { ...notDeleted, symbol: { $regex: new RegExp(`^${escapeRe(symbol)}$`, 'i') } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ timestamp: -1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getByRank = async (rank, page, limit) => {
  try {
    const r = Number(rank);
    if (!Number.isFinite(r)) {
      const e = new Error('Invalid rank');
      e.statusCode = 400;
      throw e;
    }
    const filter = { ...notDeleted, rank: r };
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

const getByMonth = async (month, page, limit) => {
  try {
    if (!MONTH_REGEX.test(month)) {
      const e = new Error('month must be YYYY-MM');
      e.statusCode = 400;
      throw e;
    }
    const filter = { ...notDeleted, month };
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
const getByDate = async (date, page, limit) => {
  try {
    if (!DATE_REGEX.test(date)) {
      const e = new Error('date must be YYYY-MM-DD');
      e.statusCode = 400;
      throw e;
    }
    const filter = { ...notDeleted, date };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ rank: 1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const getLatest = async (limit) => {
  try {
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const items = await Coin.find(notDeleted).sort({ timestamp: -1 }).limit(l).lean();
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getHistoryByCoinId = async (coinId, page, limit) => {
  try {
    const filter = { ...notDeleted, coinId: String(coinId) };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ timestamp: 1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    if (total === 0) {
      const e = new Error('No history found for this coinId');
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

const getHistoryByCoinIdAndMonth = async (coinId, month, page, limit) => {
  try {
    if (!MONTH_REGEX.test(month)) {
      const e = new Error('month must be YYYY-MM');
      e.statusCode = 400;
      throw e;
    }
    const filter = { ...notDeleted, coinId: String(coinId), month };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 31));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ timestamp: 1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    if (total === 0) {
      const e = new Error('No records for this coin and month');
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

const topByField = async (field, order, limit) => {
  try {
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const items = await Coin.find(notDeleted).sort({ [field]: order }).limit(l).lean();
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getOldest = async (limit) => {
  try {
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const items = await Coin.find(notDeleted).sort({ timestamp: 1 }).limit(l).lean();
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getNewest = async (limit) => {
  try {
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const items = await Coin.find(notDeleted).sort({ timestamp: -1 }).limit(l).lean();
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getTrending = async (limit) => {
  try {
    const l = Math.min(50, Math.max(1, Number(limit) || 15));
    const items = await Coin.aggregate([
      { $match: notDeleted },
      { $sort: { volume: -1, timestamp: -1 } },
      { $group: { _id: '$symbol', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $limit: l },
    ]);
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getRecentUpdates = async (limit) => {
  try {
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const items = await Coin.find(notDeleted).sort({ updatedAt: -1 }).limit(l).lean();
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getRandomCoin = async () => {
  try {
    const [row] = await Coin.aggregate([{ $match: notDeleted }, { $sample: { size: 1 } }]);
    if (!row) {
      const e = new Error('No coin records available');
      e.statusCode = 404;
      throw e;
    }
    return row;
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const avgOfField = async (field) => {
  const [r] = await Coin.aggregate([
    { $match: notDeleted },
    { $group: { _id: null, avg: { $avg: `$${field}` } } },
  ]);
  return r?.avg ?? 0;
};

const filterAboveAvg = async (field, page, limit) => {
  try {
    const avg = await avgOfField(field);
    const filter = { ...notDeleted, [field]: { $gt: avg } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ timestamp: -1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, average: avg, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterBelowAvg = async (field, page, limit) => {
  try {
    const avg = await avgOfField(field);
    const filter = { ...notDeleted, [field]: { $lt: avg } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ timestamp: -1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, average: avg, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterHighMarketCap = async (page, limit) => {
  try {
    const avg = await avgOfField('marketCap');
    const filter = { ...notDeleted, marketCap: { $gte: avg } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ marketCap: -1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterLowMarketCap = async (page, limit) => {
  try {
    const avg = await avgOfField('marketCap');
    const filter = { ...notDeleted, marketCap: { $lt: avg } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ marketCap: 1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterHighVolatility = async (page, limit) => {
  try {
    const avg = await avgOfField('volatility');
    const filter = { ...notDeleted, volatility: { $gt: avg } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ volatility: -1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterLowVolatility = async (page, limit) => {
  try {
    const avg = await avgOfField('volatility');
    const filter = { ...notDeleted, volatility: { $lte: avg } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ volatility: 1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterHighReturn = async (page, limit) => {
  try {
    const avg = await avgOfField('dailyReturn');
    const filter = { ...notDeleted, dailyReturn: { $gt: Math.max(0, avg) } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ dailyReturn: -1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterNegativeReturn = async (page, limit) => {
  try {
    const filter = { ...notDeleted, dailyReturn: { $lt: 0 } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ dailyReturn: 1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterBullish = async (page, limit) => {
  try {
    const filter = { ...notDeleted, dailyReturn: { $gt: 0 }, cumulativeReturn: { $gt: 0 } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ dailyReturn: -1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterBearish = async (page, limit) => {
  try {
    const filter = { ...notDeleted, dailyReturn: { $lt: 0 }, cumulativeReturn: { $lt: 0 } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ dailyReturn: 1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterProfitable = async (page, limit) => {
  try {
    const filter = { ...notDeleted, cumulativeReturn: { $gt: 0 } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ cumulativeReturn: -1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterLossMaking = async (page, limit) => {
  try {
    const filter = { ...notDeleted, cumulativeReturn: { $lt: 0 } };
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(filter).sort({ cumulativeReturn: 1 }).skip(skip).limit(l).lean(),
      Coin.countDocuments(filter),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const filterMissingValues = async (page, limit) => {
  try {
    const filter = {
      ...notDeleted,
      $or: [
        { high: null },
        { low: null },
        { high: { $exists: false } },
        { low: { $exists: false } },
      ],
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
    err.statusCode = 500;
    throw err;
  }
};

const sortSimple = async (sortObj, page, limit) => {
  try {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Coin.find(notDeleted).sort(sortObj).skip(skip).limit(l).lean(),
      Coin.countDocuments(notDeleted),
    ]);
    return { items, pagination: buildPagination(total, p, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const performanceAnalytics = async (coinId) => {
  try {
    const rows = await Coin.find({ ...notDeleted, coinId: String(coinId) }).sort({ timestamp: 1 }).lean();
    if (!rows.length) {
      const e = new Error('Coin not found');
      e.statusCode = 404;
      throw e;
    }
    const prices = rows.map((r) => r.price);
    const returns = rows.map((r) => r.dailyReturn);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const avgP = prices.reduce((a, b) => a + b, 0) / prices.length;
    const last = rows[rows.length - 1];
    const first = rows[0];
    const totalReturnPct = first.price ? ((last.price - first.price) / first.price) * 100 : 0;
    return {
      coinId,
      recordCount: rows.length,
      priceRange: { min: minP, max: maxP, average: avgP },
      latest: last,
      approxTotalReturnPercent: totalReturnPct,
      avgDailyReturn: returns.reduce((a, b) => a + b, 0) / returns.length,
    };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const volatilityAnalytics = async (coinId) => {
  try {
    const rows = await Coin.find({ ...notDeleted, coinId: String(coinId) }).sort({ timestamp: 1 }).lean();
    if (!rows.length) {
      const e = new Error('Coin not found');
      e.statusCode = 404;
      throw e;
    }
    const vols = rows.map((r) => r.volatility);
    const avgV = vols.reduce((a, b) => a + b, 0) / vols.length;
    const maxV = Math.max(...vols);
    return { coinId, averageVolatility: avgV, maxVolatility: maxV, samples: rows.length };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const marketCapDetails = async (coinId) => {
  try {
    const rows = await Coin.find({ ...notDeleted, coinId: String(coinId) }).sort({ timestamp: 1 }).lean();
    if (!rows.length) {
      const e = new Error('Coin not found');
      e.statusCode = 404;
      throw e;
    }
    const caps = rows.map((r) => r.marketCap);
    return {
      coinId,
      latestMarketCap: rows[rows.length - 1].marketCap,
      avgMarketCap: caps.reduce((a, b) => a + b, 0) / caps.length,
      maxMarketCap: Math.max(...caps),
    };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};


const volumeDetails = async (coinId) => {
  try {
    const rows = await Coin.find({ ...notDeleted, coinId: String(coinId) }).sort({ timestamp: 1 }).lean();
    if (!rows.length) {
      const e = new Error('Coin not found');
      e.statusCode = 404;
      throw e;
    }
    const vols = rows.map((r) => r.volume);
    return {
      coinId,
      latestVolume: rows[rows.length - 1].volume,
      avgVolume: vols.reduce((a, b) => a + b, 0) / vols.length,
      maxVolume: Math.max(...vols),
    };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const returnsAnalytics = async (coinId) => {
  try {
    const rows = await Coin.find({ ...notDeleted, coinId: String(coinId) }).sort({ timestamp: 1 }).lean();
    if (!rows.length) {
      const e = new Error('Coin not found');
      e.statusCode = 404;
      throw e;
    }
    const dr = rows.map((r) => r.dailyReturn);
    const cr = rows.map((r) => r.cumulativeReturn);
    return {
      coinId,
      avgDailyReturn: dr.reduce((a, b) => a + b, 0) / dr.length,
      latestCumulativeReturn: rows[rows.length - 1].cumulativeReturn,
      maxDailyReturn: Math.max(...dr),
      minDailyReturn: Math.min(...dr),
      cumulativeRange: { min: Math.min(...cr), max: Math.max(...cr) },
    };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const currentPrice = async (coinId) => {
  try {
    const doc = await Coin.findOne({ ...notDeleted, coinId: String(coinId) }).sort({ timestamp: -1 }).lean();
    if (!doc) {
      const e = new Error('Coin not found');
      e.statusCode = 404;
      throw e;
    }
    return { coinId, price: doc.price, date: doc.date, symbol: doc.symbol, name: doc.name };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const compareCoins = async (coinIds) => {
  try {
    const ids = coinIds.map(String);
    const out = [];
    for (const id of ids) {
      const doc = await Coin.findOne({ ...notDeleted, coinId: id }).sort({ timestamp: -1 }).lean();
      if (doc) out.push(doc);
    }
    if (out.length !== ids.length) {
      const e = new Error('One or more coinIds not found');
      e.statusCode = 404;
      throw e;
    }
    return { comparison: out };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const getRecommendations = async (limit) => {
  try {
    const l = Math.min(30, Math.max(1, Number(limit) || 10));
    const items = await Coin.aggregate([
      { $match: notDeleted },
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$coinId', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $match: { cumulativeReturn: { $gt: 0 }, volatility: { $lt: 50 } } },
      { $sort: { cumulativeReturn: -1 } },
      { $limit: l },
    ]);
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getPredictions = async () => {
  try {
    const [r] = await Coin.aggregate([
      { $match: notDeleted },
      { $sort: { timestamp: -1 } },
      { $limit: 500 },
      { $group: { _id: null, avgDaily: { $avg: '$dailyReturn' } } },
    ]);
    const avg = r?.avgDaily ?? 0;
    let sentiment = 'neutral';
    if (avg > 0.5) sentiment = 'bullish';
    else if (avg < -0.5) sentiment = 'bearish';
    return {
      note: 'Heuristic trend based on recent average daily return (not financial advice)',
      recentAvgDailyReturn: avg,
      sentiment,
    };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const simulatePortfolio = async (allocations) => {
  try {
    if (!Array.isArray(allocations) || allocations.length === 0) {
      const e = new Error('allocations array required: [{ coinId, amountUsd }]');
      e.statusCode = 400;
      throw e;
    }
    let total = 0;
    const positions = [];
    for (const a of allocations) {
      const amt = Number(a.amountUsd);
      if (!a.coinId || !Number.isFinite(amt) || amt <= 0) {
        const e = new Error('Each allocation needs coinId and positive amountUsd');
        e.statusCode = 400;
        throw e;
      }
      const doc = await Coin.findOne({ ...notDeleted, coinId: String(a.coinId) }).sort({ timestamp: -1 }).lean();
      if (!doc) {
        const e = new Error(`Unknown coinId: ${a.coinId}`);
        e.statusCode = 404;
        throw e;
      }
      const units = doc.price > 0 ? amt / doc.price : 0;
      positions.push({ coinId: doc.coinId, amountUsd: amt, estUnits: units, priceUsed: doc.price });
      total += amt;
    }
    return { totalInvestedUsd: total, positions };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};

const getHeatmap = async () => {
  try {
    const items = await Coin.aggregate([
      { $match: notDeleted },
      { $group: { _id: { symbol: '$symbol', date: '$date' }, dailyReturn: { $avg: '$dailyReturn' } } },
      { $project: { _id: 0, symbol: '$_id.symbol', date: '$_id.date', dailyReturn: 1 } },
      { $sort: { date: 1 } },
      { $limit: 2000 },
    ]);
    return { cells: items };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const getMarketStatus = async () => {
  try {
    const [agg] = await Coin.aggregate([
      { $match: notDeleted },
      { $sort: { timestamp: -1 } },
      { $limit: 300 },
      { $group: { _id: null, avgReturn: { $avg: '$dailyReturn' }, avgVol: { $avg: '$volatility' } } },
    ]);
    return {
      avgDailyReturnSample: agg?.avgReturn ?? 0,
      avgVolatilitySample: agg?.avgVol ?? 0,
      status:
        (agg?.avgReturn ?? 0) > 0.2 ? 'risk-on' : (agg?.avgReturn ?? 0) < -0.2 ? 'risk-off' : 'mixed',
    };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const topMonthlyPerformers = async (limit) => {
  try {
    const l = Math.min(50, Math.max(1, Number(limit) || 10));
    const items = await Coin.aggregate([
      { $match: notDeleted },
      { $group: { _id: { month: '$month', coinId: '$coinId' }, avgReturn: { $avg: '$dailyReturn' }, name: { $first: '$name' } } },
      { $sort: { avgReturn: -1 } },
      { $limit: l },
    ]);
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const topYearlyPerformers = async (limit) => {
  try {
    const l = Math.min(50, Math.max(1, Number(limit) || 10));
    const items = await Coin.aggregate([
      { $match: notDeleted },
      {
        $addFields: {
          year: { $substr: ['$date', 0, 4] },
        },
      },
      { $group: { _id: { year: '$year', coinId: '$coinId' }, avgReturn: { $avg: '$dailyReturn' }, name: { $first: '$name' } } },
      { $sort: { avgReturn: -1 } },
      { $limit: l },
    ]);
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const highVolatilityAlerts = async (threshold, limit) => {
  try {
    const t = Number(threshold) || 15;
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const items = await Coin.find({ ...notDeleted, volatility: { $gte: t } })
      .sort({ volatility: -1 })
      .limit(l)
      .lean();
    return { threshold: t, items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const marketDropAlerts = async (limit) => {
  try {
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const items = await Coin.find({ ...notDeleted, dailyReturn: { $lte: -5 } })
      .sort({ dailyReturn: 1 })
      .limit(l)
      .lean();
    return { items, pagination: buildPagination(items.length, 1, l) };
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

const submitReport = async (body) => {
  try {
    if (!body || !body.message) {
      const e = new Error('message is required');
      e.statusCode = 400;
      throw e;
    }
    return { received: true, id: new mongoose.Types.ObjectId().toString(), summary: String(body.message).slice(0, 200) };
  } catch (err) {
    if (err.statusCode) throw err;
    err.statusCode = 500;
    throw err;
  }
};
