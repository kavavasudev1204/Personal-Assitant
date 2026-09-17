const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUsers);
router.post('/', authorize('Admin'), createUser);
router.put('/:id', authorize('Admin'), updateUser);

module.exports = router;
