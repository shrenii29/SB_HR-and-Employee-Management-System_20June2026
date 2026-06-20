const db = require('../config/db');







const applyForLeave = async (req, res) => {
    try {
        const { leave_type, start_date, end_date, reason } = req.body;
        const user_id = req.user.id; 

        if (!leave_type || !start_date || !end_date) {
            return res.status(400).json({ message: 'Please provide leave type and dates.' });
        }

        const [result] = await db.query(
            'INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
            [user_id, leave_type, start_date, end_date, reason]
        );

        res.status(201).json({ message: 'Leave request submitted successfully.', leaveId: result.insertId });
    } catch (error) {
        console.error('Error applying for leave:', error);
        res.status(500).json({ message: 'Server error applying for leave.' });
    }
};



const getMyLeaves = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [leaves] = await db.query(
            'SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC',
            [user_id]
        );

        res.status(200).json(leaves);
    } catch (error) {
        console.error('Error fetching personal leaves:', error);
        res.status(500).json({ message: 'Server error fetching leaves.' });
    }
};







const getAllLeaves = async (req, res) => {
    try {
        const query = `
            SELECT l.*, u.first_name, u.last_name 
            FROM leave_requests l 
            JOIN users u ON l.user_id = u.id 
            ORDER BY l.created_at DESC
        `;
        const [leaves] = await db.query(query);

        res.status(200).json(leaves);
    } catch (error) {
        console.error('Error fetching all leaves:', error);
        res.status(500).json({ message: 'Server error fetching all leave requests.' });
    }
};



const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected.' });
        }

        const [result] = await db.query(
            'UPDATE leave_requests SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Leave request not found.' });
        }

        res.status(200).json({ message: `Leave request ${status.toLowerCase()} successfully.` });
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({ message: 'Server error updating leave status.' });
    }
};

module.exports = { applyForLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };