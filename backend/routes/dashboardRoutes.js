const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/admin', authorize('admin'), ctrl.getAdminDashboard);
router.get('/employee', authorize('admin','employee'), ctrl.getEmployeeDashboard);

module.exports = router;
