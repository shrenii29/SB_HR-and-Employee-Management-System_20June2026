const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// === Route Imports ===
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes'); // NEW
const dashboardRoutes = require('./routes/dashboardRoutes'); // NEW


// === Mount Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes); // NEW


// Basic test route
app.get('/', (req, res) => {
    res.send('HR Management API is running...');
});

// Server initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});