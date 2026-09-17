const express = require('express');
const router = express.Router();
const { getLeads, createLead, checkDuplicate, updateLead } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLeads);
router.post('/', createLead);
router.post('/check-duplicate', checkDuplicate);
router.put('/:id', updateLead);

module.exports = router;
