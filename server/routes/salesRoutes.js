const express = require('express');
const router = express.Router();
const { getSalesActivities, createSalesActivity } = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getSalesActivities);
router.post('/', createSalesActivity);

module.exports = router;
