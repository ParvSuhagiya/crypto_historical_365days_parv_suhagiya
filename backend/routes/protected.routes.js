const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const coinController = require('../controllers/coin.controller');

router.post('/coins', authMiddleware, coinController.createCoin);
router.patch('/coins/:id', authMiddleware, coinController.patchCoin);
router.delete('/coins/:id', authMiddleware, coinController.deleteCoin);

module.exports = router;
