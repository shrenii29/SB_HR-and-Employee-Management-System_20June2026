const express = require('express');
const router = express.Router();

const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware'); 
const db = require('../config/db');



router.get('/my-attendance', verifyToken, async (req, res) => {
    try {
        const sql = "SELECT * FROM attendance WHERE user_id = ? ORDER BY punch_in DESC LIMIT 30";
        const [results] = await db.query(sql, [req.user.id]); 
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.get('/all', verifyAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT a.*, u.first_name, u.last_name 
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.punch_in DESC
        `;
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ error: "Failed to fetch organization attendance." });
    }
});


router.post('/punch-in', verifyToken, async (req, res) => {
    try {
        
        const checkSql = `
    SELECT * FROM attendance 
    WHERE user_id = ? 
    AND DATE(punch_in) = CURDATE()
    LIMIT 1
`;

const [todayRecord] = await db.query(checkSql, [req.user.id]);

if (todayRecord.length > 0 && todayRecord[0].punch_out === null) {
    return res.status(400).json({ error: "You are already punched in today." });
}

        
        const insertSql = "INSERT INTO attendance (user_id) VALUES (?)";
        await db.query(insertSql, [req.user.id]);
        
        res.json({ message: "Successfully clocked in." });
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ error: "Database error during punch in." });
    }
});


router.put('/punch-out', verifyToken, async (req, res) => {
    console.log("--- PUNCH OUT INITIATED (ASYNC) ---");
    try {
const sql = `
    UPDATE attendance 
    SET punch_out = CURRENT_TIMESTAMP 
    WHERE user_id = ? 
    AND punch_out IS NULL
    AND DATE(punch_in) = CURDATE()
`;        const [result] = await db.query(sql, [req.user.id]);
        
        console.log("3. Database responded! Rows updated:", result.affectedRows);
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "No active punch-in found to punch out from." });
        }

        res.json({ message: "Punched out successfully" });
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;