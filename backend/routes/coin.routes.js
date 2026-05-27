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
router.get('/alerts/high-volatility', coinController.alertsHighVol);
router.get('/alerts/market-drop', coinController.alertsMarketDrop);
router.post('/report', coinController.submitReport);

// Filters
router.get('/filter/high-price', coinController.filterHighPrice);
router.get('/filter/low-price', coinController.filterLowPrice);
router.get('/filter/high-volume', coinController.filterHighVolume);
router.get('/filter/low-volume', coinController.filterLowVolume);
router.get('/filter/high-market-cap', coinController.filterHighMarketCap);
router.get('/filter/low-market-cap', coinController.filterLowMarketCap);
router.get('/filter/high-volatility', coinController.filterHighVolatility);
router.get('/filter/low-volatility', coinController.filterLowVolatility);
router.get('/filter/high-return', coinController.filterHighReturn);
router.get('/filter/negative-return', coinController.filterNegativeReturn);
router.get('/filter/bullish', coinController.filterBullish);
router.get('/filter/bearish', coinController.filterBearish);
router.get('/filter/profitable', coinController.filterProfitable);
router.get('/filter/loss-making', coinController.filterLossMaking);
router.get('/filter/missing-values', coinController.filterMissingValues);

// Sort
router.get('/sort/price-asc', coinController.sortPriceAsc);
router.get('/sort/price-desc', coinController.sortPriceDesc);
router.get('/sort/volume-desc', coinController.sortVolumeDesc);
router.get('/sort/rank-asc', coinController.sortRankAsc);
router.get('/sort/return-desc', coinController.sortReturnDesc);

// Lists & lookups
router.get('/latest', coinController.getLatest);
router.get('/trending', coinController.getTrending);
router.get('/recent', coinController.getRecent);
router.get('/random', coinController.getRandom);
router.get('/oldest', coinController.getOldest);
router.get('/newest', coinController.getNewest);

module.exports = router;
