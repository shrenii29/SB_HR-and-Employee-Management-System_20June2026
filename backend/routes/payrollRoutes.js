const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const db = require('../config/db');

// 1. EMPLOYEE: Get My Payslips
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

// 2. ADMIN: Get ALL Organization Payroll Records
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

// 3. ADMIN: Generate a New Payslip
router.post('/generate', verifyAdmin, async (req, res) => {
    try {
        const { user_id, month_year, basic_salary, allowances, deductions } = req.body;

        // Validation
        if (!user_id || !month_year || !basic_salary) {
            return res.status(400).json({ error: "User ID, Month/Year, and Basic Salary are required." });
        }

        // Note: We don't insert net_salary because MySQL calculates it automatically!
        const sql = `
            INSERT INTO payroll (user_id, month_year, basic_salary, allowances, deductions, status) 
            VALUES (?, ?, ?, ?, ?, 'Paid')
        `;
        
        await db.query(sql, [
            user_id, 
            month_year, 
            basic_salary, 
            allowances || 0, 
            deductions || 0
        ]);
        
        res.json({ message: "Payroll record generated successfully." });
    } catch (err) {
        // Catch duplicate month entry error
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "A payroll record for this employee already exists for this month." });
        }
        console.error("DB Error:", err.message);
        res.status(500).json({ error: "Failed to generate payroll record." });
    }
});

module.exports = router;