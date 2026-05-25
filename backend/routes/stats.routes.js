const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

router.get('/market-cap', statsController.marketCap);
router.get('/average-price', statsController.averagePrice);
router.get('/average-volume', statsController.averageVolume);
router.get('/highest-market-cap', statsController.highestMarketCap);
router.get('/highest-volume', statsController.highestVolume);
router.get('/top-gainers', statsController.topGainers);

module.exports = router;
