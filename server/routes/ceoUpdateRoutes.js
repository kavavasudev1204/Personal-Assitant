const express = require('express');
const router = express.Router();
const { getCEOUpdates, createCEOUpdate, markCEOInformed } = require('../controllers/ceoUpdateController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getCEOUpdates);
router.post('/', createCEOUpdate);
router.patch('/:id/informed', markCEOInformed);

module.exports = router;
