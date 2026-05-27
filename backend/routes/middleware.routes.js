const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { generalLimiter } = require('../middlewares/rateLimiter.middleware');

router.get('/logger', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logger middleware active — check server console',
    data: { path: req.originalUrl, method: req.method },
    pagination: {},
  });
});

router.get('/auth', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth middleware passed',
    data: { user: req.user },
    pagination: {},
  });
});

router.get('/rate-limit', generalLimiter, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Rate limiter applied',
    data: { ok: true },
    pagination: {},
  });
});

router.get('/error-handler', (req, res, next) => {
  const err = new Error('Demo error for global error handler');
  err.statusCode = 400;
  next(err);
});

module.exports = router;
