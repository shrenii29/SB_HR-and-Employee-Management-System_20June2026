const express = require('express');
const router = express.Router();
const { getAllEmployees, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// All routes below this line are protected by the verifyAdmin middleware
router.use(verifyAdmin);

// Route: GET /api/employees
router.get('/', getAllEmployees);

// Route: PUT /api/employees/:id
router.put('/:id', updateEmployee);

// Route: DELETE /api/employees/:id
router.delete('/:id', deleteEmployee);

module.exports = router;