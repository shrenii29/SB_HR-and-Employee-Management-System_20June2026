const express = require('express');
const router = express.Router();
const { generatePayroll, getMyPayroll, getAllPayroll } = require('../controllers/payrollController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, verifyAdmin, getAllPayroll);
router.post('/', verifyAdmin, generatePayroll);

// routes/payrollRoutes.js
router.get('/my-payroll', verifyToken,getMyPayroll, (req, res) => {
    // req.user.id comes from your verifyToken middleware
    const sql = "SELECT * FROM payroll WHERE user_id = ?";
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        res.json(results);
    });
});


module.exports = router;