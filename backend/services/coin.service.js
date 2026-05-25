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
