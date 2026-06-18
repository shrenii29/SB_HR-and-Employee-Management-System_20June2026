const router = require('express').Router();
const ctrl   = require('../controllers/payrollController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin','employee'), ctrl.getPayrollRecords);
router.post('/', authorize('admin'), ctrl.createPayroll);
router.get('/:id', authorize('admin','employee'), ctrl.getPayslip);
router.put('/:id', authorize('admin'), ctrl.updatePayroll);
router.delete('/:id', authorize('admin'), ctrl.deletePayroll);

module.exports = router;
