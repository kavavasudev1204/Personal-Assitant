const express = require('express');
const router = express.Router();
const { getActionCenter, getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/action-center', getActionCenter);
router.get('/stats', getDashboardStats);

module.exports = router;
