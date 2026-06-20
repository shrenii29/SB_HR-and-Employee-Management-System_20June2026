import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin Imports
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminOverview from './pages/AdminOverview';
import EmployeeList from './pages/EmployeeList';
import DepartmentManager from './pages/DepartmentManager';
import AdminLeaveManager from './pages/AdminLeaveManager'; 
import AdminAttendanceManager from './pages/AdminAttendanceManager';
import AdminPayrollManager from './pages/AdminPayrollManager';


// NEW Employee Imports
import EmployeeLayout from './pages/EmployeeLayout';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AttendancePage from './pages/AttendancePage';
import EmployeeLeave from './pages/EmployeeLeave';
import EmployeePayroll from './pages/EmployeePayroll';
import EditProfile from './pages/EditProfile';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/" element={<Login />} />
        
        {/* Admin Route */}
        <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} /> 
            <Route path="employees" element={<EmployeeList />} />
            <Route path="departments" element={<DepartmentManager />} />
            <Route path="leaves" element={<AdminLeaveManager />} /> 
            <Route path="attendance" element={<AdminAttendanceManager />} /> 
            <Route path="payroll" element={<AdminPayrollManager />} /> 
        </Route>

        {/* NEW Employee Route */}
        <Route path="/employee-dashboard" element={<EmployeeLayout />}>
  <Route index element={<EmployeeDashboard />} />
  <Route path="attendance" element={<AttendancePage />} />
  <Route path="leaves" element={<EmployeeLeave />} />
  <Route path="payroll" element={<EmployeePayroll />} />
  <Route path="profile" element={<Profile />} />
  <Route path="edit-profile" element={<EditProfile />} />
</Route>

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;