const express = require('express');
const router = express.Router();
const { getLeadReport, getSalesReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/leads', getLeadReport);
router.get('/sales', getSalesReport);

module.exports = router;
