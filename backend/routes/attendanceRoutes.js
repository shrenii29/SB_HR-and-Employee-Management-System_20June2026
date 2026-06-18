const router = require('express').Router();
const ctrl   = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin','employee'), ctrl.getAttendance);
router.get('/summary', authorize('admin','employee'), ctrl.getAttendanceSummary);
router.post('/', authorize('admin'), ctrl.markAttendance);
router.post('/bulk', authorize('admin'), ctrl.bulkMarkAttendance);
router.post('/check-in', authorize('employee'), ctrl.checkIn);
router.post('/check-out', authorize('employee'), ctrl.checkOut);
router.delete('/:id', authorize('admin'), ctrl.deleteAttendance);

module.exports = router;
