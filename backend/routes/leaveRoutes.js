const router = require('express').Router();
const ctrl   = require('../controllers/leaveController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/types', authorize('admin','employee'), ctrl.getLeaveTypes);
router.get('/', authorize('admin','employee'), ctrl.getLeaveRequests);
router.post('/', authorize('employee'), ctrl.applyLeave);
router.get('/:id', authorize('admin','employee'), ctrl.getLeaveRequest);
router.patch('/:id/review', authorize('admin'), ctrl.reviewLeave);
router.delete('/:id', authorize('employee'), ctrl.cancelLeave);

module.exports = router;
