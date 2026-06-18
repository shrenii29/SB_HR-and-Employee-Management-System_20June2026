const router = require('express').Router();
const ctrl   = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin'), ctrl.getAllEmployees);
router.post('/', authorize('admin'), ctrl.createEmployee);
router.get('/:id', authorize('admin','employee'), ctrl.getEmployee);
router.put('/:id', authorize('admin','employee'), ctrl.updateEmployee);
router.delete('/:id', authorize('admin'), ctrl.deleteEmployee);

module.exports = router;
