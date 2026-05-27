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

module.exports = router;
