const express = require('express');
const router = express.Router();
const coinController = require('../controllers/coin.controller');

// System & export (before :id)
router.get('/system/health', coinController.systemHealth);
router.head('/system/health', coinController.systemHealth);
router.options('/system/health', (req, res) => res.sendStatus(204));

router.get('/system/version', coinController.systemVersion);
router.get('/system/config', coinController.systemConfig);

router.get('/export/csv', coinController.exportCsv);
router.get('/export/json', coinController.exportJson);

router.get('/cache/clear', authMiddleware, adminMiddleware, coinController.clearCache);

// Advanced
router.get('/recommendations', coinController.recommendations);
router.get('/predictions', coinController.predictions);
router.get('/portfolio/simulate', coinController.portfolioSimulate);
router.post('/portfolio/simulate', coinController.portfolioSimulate);
router.get('/heatmap', coinController.heatmap);
router.get('/market-status', coinController.marketStatus);
router.get('/performance/top-monthly', coinController.topMonthly);
router.get('/performance/top-yearly', coinController.topYearly);

module.exports = router;
