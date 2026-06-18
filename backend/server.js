require('dotenv').config();
require('./src/config/db'); // validates DB connection at startup

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));



const app  = require('./src/app');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀  HR Management API running on http://localhost:${PORT}`);
  console.log(`    Environment : ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully…`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});