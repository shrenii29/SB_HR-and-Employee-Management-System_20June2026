const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const db = require('../config/db');


router.get('/my-payroll', verifyToken, async (req, res) => {
    try {
        const sql = "SELECT * FROM payroll WHERE user_id = ? ORDER BY month_year DESC";
        const [results] = await db.query(sql, [req.user.id]);
        res.json(results);
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ error: "Failed to fetch your payroll records." });
    }
});


router.get('/all', verifyAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT p.*, u.first_name, u.last_name 
            FROM payroll p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.month_year DESC
        `;
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ error: "Failed to fetch organization payroll." });
    }
});




router.post('/generate', verifyAdmin, async (req, res) => {
    try {
        const { user_id, month_year, basic_salary, allowances, deductions } = req.body;

        if (!user_id || !month_year || !basic_salary) {
            return res.status(400).json({ error: "User ID, Month/Year, and Basic Salary are required." });
        }

        const basic = parseFloat(basic_salary);
        const allow = parseFloat(allowances) || 0;
        const deduct = parseFloat(deductions) || 0;

        const sql = `
            INSERT INTO payroll 
            (user_id, month_year, basic_salary, allowances, deductions, status) 
            VALUES (?, ?, ?, ?, ?, 'Paid')
            ON DUPLICATE KEY UPDATE
            basic_salary = VALUES(basic_salary),
            allowances = VALUES(allowances),
            deductions = VALUES(deductions)
        `;

        await db.query(sql, [user_id, month_year, basic, allow, deduct]);

        res.json({ message: "Payroll record saved successfully." });
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ error: "Failed to update payroll record." });
    }
});

module.exports = router;