const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { searchLimiter } = require('../middlewares/rateLimiter.middleware');

router.get('/coins', searchLimiter, searchController.searchCoins);
router.head('/coins', searchLimiter, searchController.searchCoins);
router.options('/coins', (req, res) => res.sendStatus(204));

module.exports = router;
