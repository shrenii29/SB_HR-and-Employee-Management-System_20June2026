const express = require('express');
const router = express.Router();
const { getAllDepartments, createDepartment, updateDepartment } = require('../controllers/departmentController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Get all departments (Both Admins and Employees should be able to see departments)
router.get('/', verifyToken, getAllDepartments);

// Create and rename departments (Strictly Admin only)
router.post('/', verifyAdmin, createDepartment);
router.put('/:id', verifyAdmin, updateDepartment);

module.exports = router;