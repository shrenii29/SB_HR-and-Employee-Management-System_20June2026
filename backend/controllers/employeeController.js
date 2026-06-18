const bcrypt = require('bcryptjs');
const db     = require('../config/db');
const { asyncHandler, createError } = require('../middleware/errorHandler');

/* ─── GET all employees (Admin) ───────────────────────────── */

exports.getAllEmployees = asyncHandler(async (req, res) => {
  const { search = '', department_id, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_code LIKE ? OR u.email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (department_id) {
    where += ' AND e.department_id = ?';
    params.push(department_id);
  }

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM employees e JOIN users u ON u.id = e.user_id ${where}`,
    params,
  );

  const [rows] = await db.query(
    `SELECT e.*, u.email, u.role, u.is_active,
            d.name AS department_name
     FROM employees e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN departments d ON d.id = e.department_id
     ${where}
     ORDER BY e.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );

  res.json({
    success: true,
    data: rows,
    pagination: {
      total:       countRows[0].total,
      page:        Number(page),
      limit:       Number(limit),
      totalPages:  Math.ceil(countRows[0].total / Number(limit)),
    },
  });
});

/* ─── GET single employee ─────────────────────────────────── */

exports.getEmployee = asyncHandler(async (req, res) => {
  const id = req.params.id;
  // Employees can only view themselves
  if (req.user.role === 'employee' && req.user.employeeId !== Number(id)) {
    throw createError('Forbidden', 403);
  }

  const [rows] = await db.query(
    `SELECT e.*, u.email, u.role, u.is_active,
            d.name AS department_name
     FROM employees e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE e.id = ?`,
    [id],
  );
  if (!rows[0]) throw createError('Employee not found', 404);
  res.json({ success: true, data: rows[0] });
});

/* ─── CREATE employee (Admin) ─────────────────────────────── */

exports.createEmployee = asyncHandler(async (req, res) => {
  const {
    email, password = 'Employee@123',
    first_name, last_name, phone,
    department_id, designation,
    date_of_joining, date_of_birth,
    gender, address, city, state, pincode,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
  } = req.body;

  if (!email || !first_name || !last_name) {
    throw createError('Email, first name, and last name are required');
  }

  // Generate employee code
  const [[{ count }]] = await db.query('SELECT COUNT(*)+1 AS count FROM employees');
  const employee_code = `EMP${String(count).padStart(3, '0')}`;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const hashed = await bcrypt.hash(password, 10);
    const [userResult] = await conn.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email.toLowerCase().trim(), hashed, 'employee'],
    );

    await conn.query(
      `INSERT INTO employees
         (user_id, employee_code, first_name, last_name, phone, department_id,
          designation, date_of_joining, date_of_birth, gender,
          address, city, state, pincode,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relation)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userResult.insertId, employee_code,
        first_name, last_name, phone || null, department_id || null,
        designation || null, date_of_joining || null, date_of_birth || null,
        gender || null, address || null, city || null, state || null, pincode || null,
        emergency_contact_name || null, emergency_contact_phone || null,
        emergency_contact_relation || null,
      ],
    );

    await conn.commit();
    res.status(201).json({
      success: true,
      message: `Employee created. Default password: ${password}`,
      data: { employee_code },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/* ─── UPDATE employee ─────────────────────────────────────── */

exports.updateEmployee = asyncHandler(async (req, res) => {
  const id = req.params.id;

  // Employees can only edit their own record (limited fields)
  if (req.user.role === 'employee' && req.user.employeeId !== Number(id)) {
    throw createError('Forbidden', 403);
  }

  const [existing] = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
  if (!existing[0]) throw createError('Employee not found', 404);

  const allowed = req.user.role === 'admin'
    ? ['first_name','last_name','phone','department_id','designation',
       'date_of_joining','date_of_birth','gender','address','city','state','pincode',
       'emergency_contact_name','emergency_contact_phone','emergency_contact_relation']
    : ['phone','address','city','state','pincode',
       'emergency_contact_name','emergency_contact_phone','emergency_contact_relation'];

  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  if (!Object.keys(updates).length) {
    return res.json({ success: true, message: 'Nothing to update' });
  }

  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  await db.query(
    `UPDATE employees SET ${setClauses} WHERE id = ?`,
    [...Object.values(updates), id],
  );

  // Admin can also toggle user active status
  if (req.user.role === 'admin' && req.body.is_active !== undefined) {
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [
      req.body.is_active ? 1 : 0,
      existing[0].user_id,
    ]);
  }

  res.json({ success: true, message: 'Employee updated successfully' });
});

/* ─── DELETE employee (Admin) ─────────────────────────────── */

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query('SELECT user_id FROM employees WHERE id = ?', [id]);
  if (!rows[0]) throw createError('Employee not found', 404);

  // Cascade deletes employee row and associated data via FK constraints
  await db.query('DELETE FROM users WHERE id = ?', [rows[0].user_id]);

  res.json({ success: true, message: 'Employee deleted successfully' });
});