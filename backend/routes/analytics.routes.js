const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

router.get('/price/highest', analyticsController.priceHighest);
router.get('/price/lowest', analyticsController.priceLowest);
router.get('/price/average', analyticsController.priceAverage);
router.get('/price/history/:coinId', analyticsController.priceHistory);
router.get('/price/trend', analyticsController.priceTrend);
router.get('/price/growth', analyticsController.priceGrowth);
router.get('/price/drop', analyticsController.priceDrop);

router.get('/volume/highest', analyticsController.volumeHighest);
router.get('/volume/lowest', analyticsController.volumeLowest);
router.get('/volume/average', analyticsController.volumeAverage);
router.get('/volume/spike', analyticsController.volumeSpike);

router.get('/returns/top', analyticsController.returnsTop);
router.get('/returns/negative', analyticsController.returnsNegative);
router.get('/returns/cumulative', analyticsController.returnsCumulative);

router.get('/volatility/high', analyticsController.volatilityHigh);

module.exports = router;
