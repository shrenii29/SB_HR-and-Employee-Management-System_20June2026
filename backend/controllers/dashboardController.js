const db = require('../config/db');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/dashboard/summary
const getDashboardSummary = async (req, res) => {
    try {
        // Run multiple queries concurrently for speed
        const [employeeCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "Employee"');
        const [departmentCount] = await db.query('SELECT COUNT(*) as count FROM departments');
        const [pendingLeaves] = await db.query('SELECT COUNT(*) as count FROM leave_requests WHERE status = "Pending"');

        res.status(200).json({
            totalEmployees: employeeCount[0].count,
            totalDepartments: departmentCount[0].count,
            pendingLeaveRequests: pendingLeaves[0].count
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ message: 'Server error fetching dashboard analytics.' });
    }
};

module.exports = { getDashboardSummary };