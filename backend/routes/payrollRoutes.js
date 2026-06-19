const express = require('express');
const router = express.Router();
const { generatePayroll, getMyPayroll, getAllPayroll } = require('../controllers/payrollController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, verifyAdmin, getAllPayroll);
router.get('/my-payroll', verifyToken, getMyPayroll);


router.post('/', verifyAdmin, generatePayroll);
module.exports = router;