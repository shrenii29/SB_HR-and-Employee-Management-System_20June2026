const db = require('../config/db');

// ==============================
// EMPLOYEE FUNCTIONS
// ==============================

// @desc    Mark attendance for today (Clock In)
// @route   POST /api/attendance/mark
const markAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const current_time = new Date().toTimeString().split(' ')[0]; // Format: HH:MM:SS

        // Check if attendance is already marked for today
        const [existing] = await db.query(
            'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
            [user_id, today]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Attendance already marked for today.' });
        }

        const [result] = await db.query(
            'INSERT INTO attendance (user_id, date, status, clock_in) VALUES (?, ?, "Present", ?)',
            [user_id, today, current_time]
        );

        res.status(201).json({ message: 'Attendance marked successfully.', attendanceId: result.insertId });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ message: 'Server error marking attendance.' });
    }
};

// @desc    Get logged-in employee's attendance history
// @route   GET /api/attendance/my-attendance
const getMyAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [records] = await db.query(
            'SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC',
            [user_id]
        );

        res.status(200).json(records);
    } catch (error) {
        console.error('Error fetching personal attendance:', error);
        res.status(500).json({ message: 'Server error fetching attendance.' });
    }
};

// ==============================
// ADMIN FUNCTIONS
// ==============================

// @desc    Get all attendance records (with employee names)
// @route   GET /api/attendance
const getAllAttendance = async (req, res) => {
    try {
        const query = `
            SELECT a.*, u.first_name, u.last_name 
            FROM attendance a 
            JOIN users u ON a.user_id = u.id 
            ORDER BY a.date DESC, a.clock_in DESC
        `;
        const [records] = await db.query(query);

        res.status(200).json(records);
    } catch (error) {
        console.error('Error fetching all attendance records:', error);
        res.status(500).json({ message: 'Server error fetching all attendance.' });
    }
};

module.exports = { markAttendance, getMyAttendance, getAllAttendance };