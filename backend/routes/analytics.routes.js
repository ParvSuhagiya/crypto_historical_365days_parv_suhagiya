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

module.exports = router;
