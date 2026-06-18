const db = require('../config/db');
const { asyncHandler, createError } = require('../middleware/errorHandler');

const calcNet = (r) =>
  Number(r.basic_salary) + Number(r.hra) + Number(r.transport_allowance) + Number(r.other_allowances)
  - Number(r.tax_deduction) - Number(r.pf_deduction) - Number(r.other_deductions);

/* ─── GET payroll records ─────────────────────────────────── */
exports.getPayrollRecords = asyncHandler(async (req, res) => {
  const { employee_id, month, year, status, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let where = 'WHERE 1=1';
  const params = [];

  if (req.user.role === 'employee') {
    where += ' AND p.employee_id = ?';
    params.push(req.user.employeeId);
  } else if (employee_id) {
    where += ' AND p.employee_id = ?';
    params.push(employee_id);
  }

  if (month) { where += ' AND p.month = ?'; params.push(month); }
  if (year)  { where += ' AND p.year  = ?'; params.push(year);  }
  if (status){ where += ' AND p.status = ?'; params.push(status);}

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM payroll p ${where}`, params,
  );

  const [rows] = await db.query(
    `SELECT p.*, e.first_name, e.last_name, e.employee_code,
            d.name AS department_name
     FROM payroll p
     JOIN employees e ON e.id = p.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     ${where}
     ORDER BY p.year DESC, p.month DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );

  res.json({
    success: true,
    data: rows,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  });
});

/* ─── GET single payslip ──────────────────────────────────── */
exports.getPayslip = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*, e.first_name, e.last_name, e.employee_code,
            e.designation, d.name AS department_name
     FROM payroll p
     JOIN employees e ON e.id = p.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE p.id = ?`,
    [req.params.id],
  );
  if (!rows[0]) throw createError('Payroll record not found', 404);

  if (req.user.role === 'employee' && rows[0].employee_id !== req.user.employeeId) {
    throw createError('Forbidden', 403);
  }

  res.json({ success: true, data: rows[0] });
});

/* ─── CREATE payroll (Admin) ──────────────────────────────── */
exports.createPayroll = asyncHandler(async (req, res) => {
  const {
    employee_id, month, year,
    basic_salary = 0, hra = 0, transport_allowance = 0, other_allowances = 0,
    tax_deduction = 0, pf_deduction = 0, other_deductions = 0,
    status = 'pending', payment_date, notes,
  } = req.body;

  if (!employee_id || !month || !year || !basic_salary) {
    throw createError('employee_id, month, year, and basic_salary are required');
  }

  const net_salary = calcNet({ basic_salary, hra, transport_allowance, other_allowances,
                               tax_deduction, pf_deduction, other_deductions });

  const [result] = await db.query(
    `INSERT INTO payroll
       (employee_id, month, year, basic_salary, hra, transport_allowance,
        other_allowances, tax_deduction, pf_deduction, other_deductions,
        net_salary, status, payment_date, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [employee_id, month, year, basic_salary, hra, transport_allowance, other_allowances,
     tax_deduction, pf_deduction, other_deductions, net_salary,
     status, payment_date || null, notes || null],
  );

  res.status(201).json({ success: true, message: 'Payroll record created', data: { id: result.insertId, net_salary } });
});

/* ─── UPDATE payroll (Admin) ──────────────────────────────── */
exports.updatePayroll = asyncHandler(async (req, res) => {
  const [existing] = await db.query('SELECT * FROM payroll WHERE id = ?', [req.params.id]);
  if (!existing[0]) throw createError('Payroll record not found', 404);

  const fields = [
    'basic_salary','hra','transport_allowance','other_allowances',
    'tax_deduction','pf_deduction','other_deductions','status','payment_date','notes',
  ];
  const updated = { ...existing[0] };
  fields.forEach((f) => { if (req.body[f] !== undefined) updated[f] = req.body[f]; });
  updated.net_salary = calcNet(updated);

  await db.query(
    `UPDATE payroll SET
       basic_salary=?, hra=?, transport_allowance=?, other_allowances=?,
       tax_deduction=?, pf_deduction=?, other_deductions=?,
       net_salary=?, status=?, payment_date=?, notes=?
     WHERE id = ?`,
    [
      updated.basic_salary, updated.hra, updated.transport_allowance, updated.other_allowances,
      updated.tax_deduction, updated.pf_deduction, updated.other_deductions,
      updated.net_salary, updated.status, updated.payment_date || null, updated.notes || null,
      req.params.id,
    ],
  );

  res.json({ success: true, message: 'Payroll updated', data: { net_salary: updated.net_salary } });
});

/* ─── DELETE payroll (Admin) ──────────────────────────────── */
exports.deletePayroll = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT id FROM payroll WHERE id = ?', [req.params.id]);
  if (!rows[0]) throw createError('Payroll record not found', 404);
  await db.query('DELETE FROM payroll WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Payroll record deleted' });
});