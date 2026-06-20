const express = require('express');
const router = express.Router();
const { getAllDepartments, createDepartment, updateDepartment } = require('../controllers/departmentController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');


router.get('/', verifyToken, getAllDepartments);


router.post('/', verifyAdmin, createDepartment);
router.put('/:id', verifyAdmin, updateDepartment);

module.exports = router;