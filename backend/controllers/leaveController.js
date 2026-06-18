const db = require('../config/db');
const { asyncHandler, createError } = require('../middleware/errorHandler');

/* ─── helpers ─────────────────────────────────────────────── */
const calcDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e - s) / 86400000) + 1;
};

/* ─── GET leave types ─────────────────────────────────────── */
exports.getLeaveTypes = asyncHandler(async (_req, res) => {
  const [rows] = await db.query('SELECT * FROM leave_types ORDER BY name');
  res.json({ success: true, data: rows });
});

/* ─── GET leave requests ──────────────────────────────────── */
exports.getLeaveRequests = asyncHandler(async (req, res) => {
  const { status, employee_id, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let where = 'WHERE 1=1';
  const params = [];

  // Employees only see their own requests
  if (req.user.role === 'employee') {
    where += ' AND lr.employee_id = ?';
    params.push(req.user.employeeId);
  } else if (employee_id) {
    where += ' AND lr.employee_id = ?';
    params.push(employee_id);
  }

  if (status) {
    where += ' AND lr.status = ?';
    params.push(status);
  }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM leave_requests lr ${where}`, params,
  );

  const [rows] = await db.query(
    `SELECT lr.*,
            lt.name AS leave_type_name,
            e.first_name, e.last_name, e.employee_code,
            d.name AS department_name
     FROM leave_requests lr
     JOIN employees e  ON e.id  = lr.employee_id
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     LEFT JOIN departments d ON d.id = e.department_id
     ${where}
     ORDER BY lr.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );

  res.json({
    success: true,
    data: rows,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  });
});

/* ─── GET single leave request ─────────────────────────────── */
exports.getLeaveRequest = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT lr.*, lt.name AS leave_type_name,
            e.first_name, e.last_name, e.employee_code
     FROM leave_requests lr
     JOIN employees e  ON e.id  = lr.employee_id
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     WHERE lr.id = ?`,
    [req.params.id],
  );
  if (!rows[0]) throw createError('Leave request not found', 404);

  if (req.user.role === 'employee' && rows[0].employee_id !== req.user.employeeId) {
    throw createError('Forbidden', 403);
  }

  res.json({ success: true, data: rows[0] });
});

/* ─── APPLY for leave (Employee) ──────────────────────────── */
exports.applyLeave = asyncHandler(async (req, res) => {
  const { leave_type_id, start_date, end_date, reason } = req.body;

  if (!leave_type_id || !start_date || !end_date || !reason?.trim()) {
    throw createError('leave_type_id, start_date, end_date, and reason are required');
  }
  if (new Date(start_date) > new Date(end_date)) {
    throw createError('start_date cannot be after end_date');
  }

  const total_days = calcDays(start_date, end_date);

  // Overlap check
  const [overlap] = await db.query(
    `SELECT id FROM leave_requests
     WHERE employee_id = ? AND status != 'rejected'
       AND NOT (end_date < ? OR start_date > ?)`,
    [req.user.employeeId, start_date, end_date],
  );
  if (overlap.length) throw createError('You have an overlapping leave request for these dates');

  const [result] = await db.query(
    `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.employeeId, leave_type_id, start_date, end_date, total_days, reason.trim()],
  );

  res.status(201).json({
    success: true,
    message: 'Leave request submitted',
    data: { id: result.insertId, total_days },
  });
});

/* ─── REVIEW leave (Admin) ────────────────────────────────── */
exports.reviewLeave = asyncHandler(async (req, res) => {
  const { status, admin_comment } = req.body;
  const { id } = req.params;

  if (!['approved', 'rejected'].includes(status)) {
    throw createError("status must be 'approved' or 'rejected'");
  }

  const [existing] = await db.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
  if (!existing[0]) throw createError('Leave request not found', 404);
  if (existing[0].status !== 'pending') throw createError('Request already reviewed');

  await db.query(
    `UPDATE leave_requests
     SET status = ?, admin_comment = ?, reviewed_by = ?, reviewed_at = NOW()
     WHERE id = ?`,
    [status, admin_comment?.trim() || null, req.user.id, id],
  );

  res.json({ success: true, message: `Leave ${status} successfully` });
});

/* ─── DELETE leave request (Employee, only pending) ────────── */
exports.cancelLeave = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM leave_requests WHERE id = ?', [req.params.id]);
  if (!rows[0]) throw createError('Leave request not found', 404);
  if (rows[0].employee_id !== req.user.employeeId) throw createError('Forbidden', 403);
  if (rows[0].status !== 'pending') throw createError('Cannot cancel a reviewed request');

  await db.query('DELETE FROM leave_requests WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Leave request cancelled' });
});