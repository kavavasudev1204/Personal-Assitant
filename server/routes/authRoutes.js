const express = require('express');
const router = express.Router();
const { login, getMe, register, seedDemoAccounts } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('Admin'), register);
router.post('/seed', seedDemoAccounts);
router.get('/seed', seedDemoAccounts);

module.exports = router;
