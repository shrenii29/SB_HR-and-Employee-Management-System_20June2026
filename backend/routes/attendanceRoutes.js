const express = require('express');
const router = express.Router();
const { markAttendance, getMyAttendance, getAllAttendance } = require('../controllers/attendanceController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// === Employee Routes ===
router.post('/mark', verifyToken, markAttendance);
router.get('/my-attendance', verifyToken, getMyAttendance);

// === Admin Routes ===
router.get('/', verifyAdmin, getAllAttendance);

module.exports = router;