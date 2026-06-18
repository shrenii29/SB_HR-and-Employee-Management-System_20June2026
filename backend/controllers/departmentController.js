const db = require('../config/db');

// @desc    Get all departments
// @route   GET /api/departments
const getAllDepartments = async (req, res) => {
    try {
        const [departments] = await db.query('SELECT * FROM departments ORDER BY name ASC');
        res.status(200).json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Server error fetching departments.' });
    }
};

// @desc    Create a new department
// @route   POST /api/departments
const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Department name is required.' });
        }

        const [result] = await db.query('INSERT INTO departments (name) VALUES (?)', [name]);
        
        res.status(201).json({ message: 'Department created successfully.', departmentId: result.insertId });
    } catch (error) {
        // Handle duplicate name errors
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Department already exists.' });
        }
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Server error creating department.' });
    }
};

// @desc    Rename a department
// @route   PUT /api/departments/:id
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'New department name is required.' });
        }

        const [result] = await db.query('UPDATE departments SET name = ? WHERE id = ?', [name, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        res.status(200).json({ message: 'Department renamed successfully.' });
    } catch (error) {
        console.error('Error renaming department:', error);
        res.status(500).json({ message: 'Server error renaming department.' });
    }
};

module.exports = { getAllDepartments, createDepartment, updateDepartment };