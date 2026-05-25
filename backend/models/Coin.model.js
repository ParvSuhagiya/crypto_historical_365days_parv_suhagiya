const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema(
  {
    coinId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    symbol: { type: String, required: true, trim: true },
    rank: { type: Number, required: true },
    date: { type: String, required: true },
    month: { type: String, required: true },
    timestamp: { type: Date, required: true },
    price: { type: Number, required: true },
    marketCap: { type: Number, required: true },
    volume: { type: Number, required: true },
    dailyReturn: { type: Number, default: 0 },
    cumulativeReturn: { type: Number, default: 0 },
    volatility: { type: Number, default: 0 },
    high: { type: Number },
    low: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

coinSchema.index({ name: 1 });
coinSchema.index({ symbol: 1 });
coinSchema.index({ rank: 1 });
coinSchema.index({ month: 1 });
coinSchema.index({ date: 1 });
coinSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Coin', coinSchema);
