const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.use(authMiddleware, adminMiddleware);

router.get('/coins', adminController.listCoins);
router.get('/stats', adminController.dashboardStats);
router.get('/users', adminController.listUsers);

module.exports = router;
