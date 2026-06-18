const db = require('../config/db');
const { asyncHandler, createError } = require('../middleware/errorHandler');

/* ─── GET attendance records ──────────────────────────────── */
exports.getAttendance = asyncHandler(async (req, res) => {
  const { employee_id, month, year, page = 1, limit = 31 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let where = 'WHERE 1=1';
  const params = [];

  if (req.user.role === 'employee') {
    where += ' AND a.employee_id = ?';
    params.push(req.user.employeeId);
  } else if (employee_id) {
    where += ' AND a.employee_id = ?';
    params.push(employee_id);
  }

  if (month && year) {
    where += ' AND MONTH(a.date) = ? AND YEAR(a.date) = ?';
    params.push(month, year);
  } else if (year) {
    where += ' AND YEAR(a.date) = ?';
    params.push(year);
  }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM attendance a ${where}`, params,
  );

  const [rows] = await db.query(
    `SELECT a.*, e.first_name, e.last_name, e.employee_code
     FROM attendance a
     JOIN employees e ON e.id = a.employee_id
     ${where}
     ORDER BY a.date DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );

  res.json({
    success: true,
    data: rows,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  });
});

/* ─── GET attendance summary (monthly) ───────────────────── */
exports.getAttendanceSummary = asyncHandler(async (req, res) => {
  const { employee_id, month, year } = req.query;
  const empId = req.user.role === 'employee' ? req.user.employeeId : employee_id;
  if (!empId) throw createError('employee_id required', 400);

  const m = month || new Date().getMonth() + 1;
  const y = year  || new Date().getFullYear();

  const [rows] = await db.query(
    `SELECT
       COUNT(*) AS total_days,
       SUM(status = 'present')   AS present,
       SUM(status = 'absent')    AS absent,
       SUM(status = 'late')      AS late,
       SUM(status = 'half_day')  AS half_day,
       SUM(status = 'on_leave')  AS on_leave
     FROM attendance
     WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
    [empId, m, y],
  );

  res.json({ success: true, data: rows[0] });
});

/* ─── MARK attendance (Admin) ────────────────────────────── */
exports.markAttendance = asyncHandler(async (req, res) => {
  const { employee_id, date, check_in, check_out, status, notes } = req.body;
  if (!employee_id || !date || !status) {
    throw createError('employee_id, date, and status are required');
  }

  await db.query(
    `INSERT INTO attendance (employee_id, date, check_in, check_out, status, notes)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       check_in = VALUES(check_in), check_out = VALUES(check_out),
       status = VALUES(status), notes = VALUES(notes)`,
    [employee_id, date, check_in || null, check_out || null, status, notes || null],
  );

  res.status(201).json({ success: true, message: 'Attendance recorded' });
});

/* ─── BULK mark attendance (Admin) ─────────────────────────  */
exports.bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { records } = req.body; // [{ employee_id, date, status, check_in, check_out }]
  if (!Array.isArray(records) || !records.length) {
    throw createError('records array is required');
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const r of records) {
      await conn.query(
        `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           check_in = VALUES(check_in), check_out = VALUES(check_out),
           status = VALUES(status)`,
        [r.employee_id, r.date, r.check_in || null, r.check_out || null, r.status || 'present'],
      );
    }
    await conn.commit();
    res.json({ success: true, message: `${records.length} attendance records saved` });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/* ─── Employee self check-in / check-out ─────────────────── */
exports.checkIn = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const now   = new Date().toTimeString().split(' ')[0];

  const [existing] = await db.query(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [req.user.employeeId, today],
  );

  if (existing[0]?.check_in) throw createError('Already checked in today');

  const hour = new Date().getHours();
  const status = hour >= 10 ? 'late' : 'present';   // 10:00 AM cutoff

  await db.query(
    `INSERT INTO attendance (employee_id, date, check_in, status)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), status = VALUES(status)`,
    [req.user.employeeId, today, now, status],
  );

  res.json({ success: true, message: 'Checked in', data: { check_in: now, status } });
});

exports.checkOut = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const now   = new Date().toTimeString().split(' ')[0];

  const [existing] = await db.query(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [req.user.employeeId, today],
  );

  if (!existing[0]) throw createError('No check-in found for today');
  if (existing[0].check_out) throw createError('Already checked out today');

  await db.query(
    'UPDATE attendance SET check_out = ? WHERE employee_id = ? AND date = ?',
    [now, req.user.employeeId, today],
  );

  res.json({ success: true, message: 'Checked out', data: { check_out: now } });
});

/* ─── DELETE attendance record (Admin) ───────────────────── */
exports.deleteAttendance = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT id FROM attendance WHERE id = ?', [req.params.id]);
  if (!rows[0]) throw createError('Record not found', 404);
  await db.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Attendance record deleted' });
});