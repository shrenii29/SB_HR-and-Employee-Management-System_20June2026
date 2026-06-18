const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/db');
const { asyncHandler, createError } = require('../middleware/errorHandler');

/* ─── helpers ─────────────────────────────────────────────── */

const signAccess   = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRES_IN         || '15m' });

const signRefresh  = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'  });

/* ─── login ───────────────────────────────────────────────── */

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw createError('Email and password are required', 400);

  const [rows] = await db.query(
    `SELECT u.*, e.id AS employee_id
     FROM users u
     LEFT JOIN employees e ON e.user_id = u.id
     WHERE u.email = ? AND u.is_active = 1`,
    [email.toLowerCase().trim()],
  );

  const user = rows[0];
  if (!user) throw createError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw createError('Invalid credentials', 401);

  const payload = {
    id:         user.id,
    email:      user.email,
    role:       user.role,
    employeeId: user.employee_id,
  };

  const accessToken  = signAccess(payload);
  const refreshToken = signRefresh({ id: user.id });

  // Persist refresh token (single-device; replace to support multi-device)
  await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      refreshToken,
      user: {
        id:         user.id,
        email:      user.email,
        role:       user.role,
        employeeId: user.employee_id,
      },
    },
  });
});

/* ─── refresh token ───────────────────────────────────────── */

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw createError('Refresh token required', 401);

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw createError('Invalid or expired refresh token', 401);
  }

  const [rows] = await db.query(
    `SELECT u.*, e.id AS employee_id
     FROM users u
     LEFT JOIN employees e ON e.user_id = u.id
     WHERE u.id = ? AND u.refresh_token = ? AND u.is_active = 1`,
    [decoded.id, refreshToken],
  );

  if (!rows[0]) throw createError('Invalid refresh token', 401);

  const user = rows[0];
  const payload = { id: user.id, email: user.email, role: user.role, employeeId: user.employee_id };
  const newAccess  = signAccess(payload);
  const newRefresh = signRefresh({ id: user.id });

  await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [newRefresh, user.id]);

  res.json({ success: true, data: { accessToken: newAccess, refreshToken: newRefresh } });
});

/* ─── logout ──────────────────────────────────────────────── */

exports.logout = asyncHandler(async (req, res) => {
  await db.query('UPDATE users SET refresh_token = NULL WHERE id = ?', [req.user.id]);
  res.json({ success: true, message: 'Logged out successfully' });
});

/* ─── get current user profile ────────────────────────────── */

exports.getMe = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT u.id, u.email, u.role, u.is_active, u.created_at,
            e.id AS employee_id, e.employee_code, e.first_name, e.last_name,
            e.phone, e.designation, e.profile_image,
            d.name AS department
     FROM users u
     LEFT JOIN employees e ON e.user_id = u.id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE u.id = ?`,
    [req.user.id],
  );
  if (!rows[0]) throw createError('User not found', 404);
  res.json({ success: true, data: rows[0] });
});

/* ─── change password ─────────────────────────────────────── */

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw createError('Both current and new password are required');
  if (newPassword.length < 6) throw createError('New password must be at least 6 characters');

  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const user = rows[0];
  if (!user) throw createError('User not found', 404);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw createError('Current password is incorrect', 400);

  const hashed = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

  res.json({ success: true, message: 'Password updated successfully' });
});