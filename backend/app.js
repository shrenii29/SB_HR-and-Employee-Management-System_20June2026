require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

/* ─── Security middleware ─────────────────────────────────── */
app.use(helmet());
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

/* ─── Rate limiting ───────────────────────────────────────── */
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      Number(process.env.RATE_LIMIT_MAX)        || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

/* ─── Auth endpoints get a stricter limiter ───────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});

/* ─── Body parser ─────────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ─── Logger ──────────────────────────────────────────────── */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

/* ─── Routes ──────────────────────────────────────────────── */
app.use('/api/v1/auth',        authLimiter, require('./routes/authRoutes'));
app.use('/api/v1/employees',   require('./routes/employeeRoutes'));
app.use('/api/v1/departments', require('./routes/departmentRoutes'));
app.use('/api/v1/leaves',      require('./routes/leaveRoutes'));
app.use('/api/v1/attendance',  require('./routes/attendanceRoutes'));
app.use('/api/v1/payroll',     require('./routes/payrollRoutes'));
app.use('/api/v1/dashboard',   require('./routes/dashboardRoutes'));

/* ─── Health check ────────────────────────────────────────── */
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

/* ─── 404 ─────────────────────────────────────────────────── */
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' }),
);

/* ─── Global error handler (must be last) ─────────────────── */
app.use(errorHandler);

module.exports = app;