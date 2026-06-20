const db = require('../config/db');
const bcrypt = require('bcryptjs');



const getAllEmployees = async (req, res) => {
    try {
        
        const [employees] = await db.query(
            'SELECT id, first_name, last_name, email, department_id, phone_number, created_at FROM users WHERE role = "Employee"'
        );
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server error fetching employees.' });
    }
};



const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, phone_number, department_id } = req.body;

        const [result] = await db.query(
            'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone_number = ?, department_id = ? WHERE id = ? AND role = "Employee"',
            [first_name, last_name, email, phone_number, department_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        res.status(200).json({ message: 'Employee updated successfully.' });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Server error updating employee.' });
    }
};



const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM users WHERE id = ? AND role = "Employee"', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        res.status(200).json({ message: 'Employee deleted successfully.' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Server error deleting employee.' });
    }
};

module.exports = { getAllEmployees, updateEmployee, deleteEmployee };