require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const loggerMiddleware = require('./middlewares/logger.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { generalLimiter } = require('./middlewares/rateLimiter.middleware');

const coinRoutes = require('./routes/coin.routes');
const authRoutes = require('./routes/auth.routes');
const searchRoutes = require('./routes/search.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  })
);

app.use(express.json());
app.use(loggerMiddleware);
app.use(generalLimiter);

app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Crypto Market Analytics API v1',
    data: { docs: '/api/v1/coins/system/health' },
    pagination: {},
  });
});

app.use('/api/v1/coins', coinRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/stats', statsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

module.exports = app;
