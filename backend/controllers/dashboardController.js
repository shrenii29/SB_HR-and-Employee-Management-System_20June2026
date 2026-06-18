const db = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

/* ─── Admin dashboard analytics ──────────────────────────── */
exports.getAdminDashboard = asyncHandler(async (_req, res) => {
  const [[employees]]   = await db.query('SELECT COUNT(*) AS total FROM employees');
  const [[departments]] = await db.query('SELECT COUNT(*) AS total FROM departments');
  const [[pendingLeave]]= await db.query("SELECT COUNT(*) AS total FROM leave_requests WHERE status='pending'");

  const today = new Date().toISOString().split('T')[0];
  const [[todayAtt]] = await db.query(
    "SELECT COUNT(*) AS total FROM attendance WHERE date = ? AND status IN ('present','late')",
    [today],
  );

  // Department-wise headcount (for bar chart)
  const [deptHeadcount] = await db.query(
    `SELECT d.name, COUNT(e.id) AS count
     FROM departments d
     LEFT JOIN employees e ON e.department_id = d.id
     GROUP BY d.id, d.name
     ORDER BY count DESC`,
  );

  // Monthly attendance summary for last 6 months
  const [monthlySummary] = await db.query(
    `SELECT YEAR(date) AS year, MONTH(date) AS month,
            SUM(status='present') AS present,
            SUM(status='absent')  AS absent,
            SUM(status='late')    AS late
     FROM attendance
     WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY year, month
     ORDER BY year, month`,
  );

  // Recent leave requests
  const [recentLeave] = await db.query(
    `SELECT lr.id, lr.status, lr.start_date, lr.end_date, lr.created_at,
            lt.name AS leave_type,
            e.first_name, e.last_name
     FROM leave_requests lr
     JOIN employees e ON e.id = lr.employee_id
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     ORDER BY lr.created_at DESC
     LIMIT 5`,
  );

  // Payroll summary current month
  const curMonth = new Date().getMonth() + 1;
  const curYear  = new Date().getFullYear();
  const [[payrollSummary]] = await db.query(
    `SELECT COUNT(*) AS total_records,
            SUM(net_salary) AS total_payout,
            SUM(status='paid') AS paid,
            SUM(status='pending') AS pending
     FROM payroll WHERE month = ? AND year = ?`,
    [curMonth, curYear],
  );

  res.json({
    success: true,
    data: {
      summary: {
        totalEmployees:    employees.total,
        totalDepartments:  departments.total,
        pendingLeaveCount: pendingLeave.total,
        todayPresent:      todayAtt.total,
      },
      deptHeadcount,
      monthlySummary,
      recentLeave,
      payrollSummary,
    },
  });
});

/* ─── Employee dashboard ──────────────────────────────────── */
exports.getEmployeeDashboard = asyncHandler(async (req, res) => {
  const empId = req.user.employeeId;

  // Current month attendance
  const curMonth = new Date().getMonth() + 1;
  const curYear  = new Date().getFullYear();

  const [[attSummary]] = await db.query(
    `SELECT
       SUM(status='present')  AS present,
       SUM(status='absent')   AS absent,
       SUM(status='late')     AS late,
       SUM(status='half_day') AS half_day
     FROM attendance
     WHERE employee_id = ? AND MONTH(date)=? AND YEAR(date)=?`,
    [empId, curMonth, curYear],
  );

  // Leave balance (pending + approved this year)
  const [leaveUsage] = await db.query(
    `SELECT lt.name, lt.days_allowed,
            COALESCE(SUM(lr.total_days),0) AS used
     FROM leave_types lt
     LEFT JOIN leave_requests lr
       ON lr.leave_type_id = lt.id
       AND lr.employee_id = ?
       AND lr.status = 'approved'
       AND YEAR(lr.start_date) = ?
     GROUP BY lt.id`,
    [empId, curYear],
  );

  // Recent leave requests
  const [recentLeave] = await db.query(
    `SELECT lr.*, lt.name AS leave_type_name
     FROM leave_requests lr
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     WHERE lr.employee_id = ?
     ORDER BY lr.created_at DESC
     LIMIT 3`,
    [empId],
  );

  // Latest payslip
  const [payslip] = await db.query(
    `SELECT * FROM payroll WHERE employee_id = ?
     ORDER BY year DESC, month DESC LIMIT 1`,
    [empId],
  );

  // Today's attendance
  const today = new Date().toISOString().split('T')[0];
  const [todayAtt] = await db.query(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [empId, today],
  );

  res.json({
    success: true,
    data: { attSummary, leaveUsage, recentLeave, latestPayslip: payslip[0] || null, todayAttendance: todayAtt[0] || null },
  });
});