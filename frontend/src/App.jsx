import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout    from './components/common/AdminLayout';
import EmployeeLayout from './components/common/EmployeeLayout';

// Auth
import Login from './pages/Login';

// Admin pages
import AdminDashboard   from './pages/admin/Dashboard';
import AdminEmployees   from './pages/admin/Employees';
import AdminDepartments from './pages/admin/Departments';
import AdminLeave       from './pages/admin/LeaveManagement';
import AdminAttendance  from './pages/admin/Attendance';
import AdminPayroll     from './pages/admin/Payroll';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProfile   from './pages/employee/Profile';
import EmployeeLeave     from './pages/employee/LeaveApplication';
import EmployeeAttendance from './pages/employee/MyAttendance';
import EmployeePayroll   from './pages/employee/MyPayroll';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace /> : <Login />} />

      {/* Admin routes */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"             element={<AdminDashboard />} />
          <Route path="/admin/employees"   element={<AdminEmployees />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/leave"       element={<AdminLeave />} />
          <Route path="/admin/attendance"  element={<AdminAttendance />} />
          <Route path="/admin/payroll"     element={<AdminPayroll />} />
        </Route>
      </Route>

      {/* Employee routes */}
      <Route element={<ProtectedRoute role="employee" />}>
        <Route element={<EmployeeLayout />}>
          <Route path="/employee"             element={<EmployeeDashboard />} />
          <Route path="/employee/profile"     element={<EmployeeProfile />} />
          <Route path="/employee/leave"       element={<EmployeeLeave />} />
          <Route path="/employee/attendance"  element={<EmployeeAttendance />} />
          <Route path="/employee/payroll"     element={<EmployeePayroll />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="/"  element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/employee') : '/login'} replace />} />
      <Route path="*"  element={<Navigate to="/" replace />} />
    </Routes>
  );
}