require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Coin = require('./models/Coin.model');

const DATA_PATH = path.join(__dirname, 'data', 'crypto-dataset.json');

const normalizeRecord = (row) => {
  const date = String(row.date);
  const month = row.month || date.slice(0, 7);
  const symbol = String(row.symbol || '').toUpperCase();
  const coinId = row.coinId || `${symbol.toLowerCase()}-${date}`;

  return {
    coinId,
    name: row.name,
    symbol,
    rank: Number(row.rank),
    date,
    month,
    timestamp: row.timestamp ? new Date(row.timestamp) : new Date(`${date}T00:00:00.000Z`),
    price: Number(row.price),
    marketCap: Number(row.marketCap),
    volume: Number(row.volume),
    dailyReturn: Number(row.dailyReturn ?? 0),
    cumulativeReturn: Number(row.cumulativeReturn ?? 0),
    volatility: Number(row.volatility ?? 0),
    high: row.high != null ? Number(row.high) : undefined,
    low: row.low != null ? Number(row.low) : undefined,
    isDeleted: false,
  };
};

const seed = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not set');
    }
    if (!fs.existsSync(DATA_PATH)) {
      throw new Error(`Dataset not found at ${DATA_PATH}`);
    }

    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? parsed : parsed.data || parsed.coins || [];

    if (!rows.length) {
      throw new Error('Dataset is empty');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    await Coin.deleteMany({});
    console.log('Cleared coins collection');

    const docs = rows.map(normalizeRecord);
    const inserted = await Coin.insertMany(docs, { ordered: false });
    console.log(`Inserted ${inserted.length} coin records`);

    await mongoose.disconnect();
    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
