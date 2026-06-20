const express = require('express');
const router = express.Router();
const db = require('../config/db');

const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { phone_number } = req.body;

    
    if (!phone_number) {
      return res.status(400).json({ error: "Phone number required" });
    }

    
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ error: "Phone must be exactly 10 digits" });
    }

  
    await db.query(
      "UPDATE users SET phone_number = ? WHERE id = ?",
      [phone_number, req.user.id]
    );

  
    const [[updatedUser]] = await db.query(`
      SELECT u.*, d.name AS department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?
    `, [req.user.id]);

    res.json({ user: updatedUser });

  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT u.*, d.name AS department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.role = 'Employee'
    `);

    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

module.exports = router;