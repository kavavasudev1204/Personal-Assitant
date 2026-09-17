const express = require('express');
const router = express.Router();
const { getOpportunities, createOpportunity } = require('../controllers/opportunityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getOpportunities);
router.post('/', createOpportunity);

module.exports = router;
