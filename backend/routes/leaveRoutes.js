const express = require('express');
const router = express.Router();
const { applyForLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// === Employee Routes (Requires just a valid login token) ===
router.post('/apply', verifyToken, applyForLeave);
router.get('/my-leaves', verifyToken, getMyLeaves);

// === Admin Routes (Requires Admin privileges) ===
router.get('/', verifyAdmin, getAllLeaves);
router.put('/:id/status', verifyAdmin, updateLeaveStatus);

module.exports = router;