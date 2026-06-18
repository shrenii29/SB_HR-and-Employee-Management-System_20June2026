const db = require('../config/db');

// @desc    Generate payroll for an employee (Admin only)
// @route   POST /api/payroll
const generatePayroll = async (req, res) => {
    try {
        const { user_id, month_year, basic_salary, allowances, deductions } = req.body;

        if (!user_id || !month_year || !basic_salary) {
            return res.status(400).json({ message: 'Please provide user_id, month_year, and basic_salary.' });
        }

        const [result] = await db.query(
            'INSERT INTO payroll (user_id, month_year, basic_salary, allowances, deductions) VALUES (?, ?, ?, ?, ?)',
            [user_id, month_year, basic_salary, allowances || 0, deductions || 0]
        );

        res.status(201).json({ message: 'Payroll record generated successfully.', payrollId: result.insertId });
    } catch (error) {
        console.error('Error generating payroll:', error);
        res.status(500).json({ message: 'Server error generating payroll.' });
    }
};

// @desc    Get logged-in employee's payroll history
// @route   GET /api/payroll/my-payroll
const getMyPayroll = async (req, res) => {
    try {
        const [records] = await db.query(
            'SELECT * FROM payroll WHERE user_id = ? ORDER BY id DESC',
            [req.user.id]
        );
        res.status(200).json(records);
    } catch (error) {
        console.error('Error fetching payroll:', error);
        res.status(500).json({ message: 'Server error fetching payroll.' });
    }
};

module.exports = { generatePayroll, getMyPayroll };