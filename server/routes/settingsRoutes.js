const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getSettings);
router.put('/', authorize('Admin', 'Assistant'), updateSettings);

module.exports = router;
