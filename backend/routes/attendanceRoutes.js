const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware'); // Your existing file
const db = require('../config/db');

// Punch In
router.post('/punch-in', verifyToken, (req, res) => {
    const sql = "INSERT INTO attendance (user_id) VALUES (?)";
    db.query(sql, [req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Punched in successfully" });
    });
});

// Punch Out
router.put('/punch-out', verifyToken, (req, res) => {
    const sql = "UPDATE attendance SET punch_out = CURRENT_TIMESTAMP WHERE user_id = ? AND punch_out IS NULL ORDER BY id DESC LIMIT 1";
    db.query(sql, [req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Punched out successfully" });
    });
});

module.exports = router;