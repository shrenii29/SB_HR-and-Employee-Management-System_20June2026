const db = require('../config/db');







const markAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        const today = new Date().toISOString().split('T')[0]; 
        const current_time = new Date().toTimeString().split(' ')[0]; 

        
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