const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/summary', verifyAdmin, getDashboardSummary);

module.exports = router;