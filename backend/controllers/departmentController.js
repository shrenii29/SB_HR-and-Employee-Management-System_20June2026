const db = require('../config/db');
const { asyncHandler, createError } = require('../middleware/errorHandler');

/* GET all departments */
exports.getAllDepartments = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT d.*, COUNT(e.id) AS employee_count
     FROM departments d
     LEFT JOIN employees e ON e.department_id = d.id
     GROUP BY d.id
     ORDER BY d.name`,
  );
  res.json({ success: true, data: rows });
});

/* GET single department with employees */
exports.getDepartment = asyncHandler(async (req, res) => {
  const [dept] = await db.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);
  if (!dept[0]) throw createError('Department not found', 404);

  const [employees] = await db.query(
    `SELECT e.id, e.employee_code, e.first_name, e.last_name, e.designation
     FROM employees e WHERE e.department_id = ?`,
    [req.params.id],
  );

  res.json({ success: true, data: { ...dept[0], employees } });
});

/* CREATE department */
exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim()) throw createError('Department name is required');

  const [result] = await db.query(
    'INSERT INTO departments (name, description) VALUES (?, ?)',
    [name.trim(), description?.trim() || null],
  );

  res.status(201).json({
    success: true,
    message: 'Department created',
    data: { id: result.insertId, name, description },
  });
});

/* UPDATE department */
exports.updateDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const [existing] = await db.query('SELECT * FROM departments WHERE id = ?', [req.params.id]);
  if (!existing[0]) throw createError('Department not found', 404);

  await db.query(
    'UPDATE departments SET name = ?, description = ? WHERE id = ?',
    [name?.trim() || existing[0].name, description ?? existing[0].description, req.params.id],
  );

  res.json({ success: true, message: 'Department updated' });
});

/* DELETE department */
exports.deleteDepartment = asyncHandler(async (req, res) => {
  const [existing] = await db.query('SELECT id FROM departments WHERE id = ?', [req.params.id]);
  if (!existing[0]) throw createError('Department not found', 404);

  // Unassign employees first (SET NULL via FK already handles this)
  await db.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Department deleted' });
});

/* Assign employee to department */
exports.assignEmployee = asyncHandler(async (req, res) => {
  const { department_id: deptId } = req.params;
  const { employee_id } = req.body;

  const [dept] = await db.query('SELECT id FROM departments WHERE id = ?', [deptId]);
  if (!dept[0]) throw createError('Department not found', 404);

  const [emp] = await db.query('SELECT id FROM employees WHERE id = ?', [employee_id]);
  if (!emp[0]) throw createError('Employee not found', 404);

  await db.query('UPDATE employees SET department_id = ? WHERE id = ?', [deptId, employee_id]);
  res.json({ success: true, message: 'Employee assigned to department' });
});