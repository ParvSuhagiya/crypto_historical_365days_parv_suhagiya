const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

router.get('/market-cap', statsController.marketCap);
router.get('/average-price', statsController.averagePrice);
router.get('/average-volume', statsController.averageVolume);
router.get('/highest-market-cap', statsController.highestMarketCap);
router.get('/highest-volume', statsController.highestVolume);
router.get('/top-gainers', statsController.topGainers);
router.get('/top-losers', statsController.topLosers);
router.get('/monthly-analysis', statsController.monthlyAnalysis);
router.get('/coin-count', statsController.coinCount);
router.get('/rank-distribution', statsController.rankDistribution);
router.get('/price-distribution', statsController.priceDistribution);
router.get('/volatility-distribution', statsController.volatilityDistribution);
router.get('/market-summary', statsController.marketSummary);
router.get('/daily-analysis', statsController.dailyAnalysis);
router.get('/yearly-analysis', statsController.yearlyAnalysis);

module.exports = router;
