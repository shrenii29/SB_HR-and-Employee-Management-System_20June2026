const express = require('express');
const router = express.Router();
const { generatePayroll, getMyPayroll } = require('../controllers/payrollController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyAdmin, generatePayroll);
router.get('/my-payroll', verifyToken, getMyPayroll);

module.exports = router;