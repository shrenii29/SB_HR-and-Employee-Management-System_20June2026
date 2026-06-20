const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const db = require('../config/db');


router.post('/apply', verifyToken, async (req, res) => {
    try {
        const { leave_type, start_date, end_date, reason } = req.body;
        
        
        if (!leave_type || !start_date || !end_date) {
            return res.status(400).json({ error: "Please provide leave type and dates." });
        }

        const sql = "INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)";
        await db.query(sql, [req.user.id, leave_type, start_date, end_date, reason]);
        
        res.json({ message: "Leave request submitted successfully." });
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ error: "Failed to submit leave request." });
    }
});


router.get('/my-leaves', verifyToken, async (req, res) => {
    try {
        const sql = "SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC";
        const [results] = await db.query(sql, [req.user.id]);
        res.json(results);
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ error: "Failed to fetch your leave history." });
    }
});


router.get('/all', verifyAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT l.*, u.first_name, u.last_name 
            FROM leave_requests l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
        `;
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ error: "Failed to fetch organization leave requests." });
    }
});


router.put('/update-status/:id', verifyAdmin, async (req, res) => {
    try {
        const leaveId = req.params.id;
        const { status } = req.body; 

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: "Invalid status update." });
        }

        const sql = "UPDATE leave_requests SET status = ? WHERE id = ?";
        const [result] = await db.query(sql, [status, leaveId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Leave request not found." });
        }

        res.json({ message: `Leave request ${status.toLowerCase()} successfully.` });
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ error: "Failed to update leave status." });
    }
}); 


router.get('/my-leave-summary', verifyToken, async (req, res) => {
  const [[result]] = await db.query(`
    SELECT COUNT(*) AS used_leaves
    FROM leave_requests
    WHERE user_id = ?
    AND status = 'Approved'
  `, [req.user.id]);

  const total = 12;

  res.json({
    total,
    used: result.used_leaves,
    remaining: total - result.used_leaves
  });
});


router.get('/pending-count', verifyAdmin, async (req, res) => {
  try {
    const [[result]] = await db.query(`
      SELECT COUNT(*) AS pending
      FROM leave_requests
      WHERE status = 'Pending'
    `);

    res.json({ pending: result.pending });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending leaves" });
  }
});


module.exports = router;