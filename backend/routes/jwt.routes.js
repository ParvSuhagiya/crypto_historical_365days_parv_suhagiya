const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.get('/profile', authMiddleware, authController.jwtProfile);
router.get('/dashboard', authMiddleware, authController.jwtDashboard);
router.post('/generate-token', authMiddleware, authController.generateToken);
router.post('/verify-token', authController.verifyToken);
router.get('/admin', authMiddleware, adminMiddleware, authController.jwtAdmin);
router.get('/private-stats', authMiddleware, authController.privateStats);
router.post('/refresh-token', authMiddleware, authController.refreshToken);
router.delete('/revoke-token', authMiddleware, authController.revokeToken);

module.exports = router;
