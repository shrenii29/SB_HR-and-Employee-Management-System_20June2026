const router = require('express').Router();
const ctrl   = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin','employee'), ctrl.getAllDepartments);
router.post('/', authorize('admin'), ctrl.createDepartment);
router.get('/:id', authorize('admin','employee'), ctrl.getDepartment);
router.put('/:id', authorize('admin'), ctrl.updateDepartment);
router.delete('/:id', authorize('admin'), ctrl.deleteDepartment);
router.post('/:department_id/assign', authorize('admin'), ctrl.assignEmployee);

module.exports = router;
