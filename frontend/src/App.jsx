import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Page Imports ---
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminOverview from './pages/AdminOverview';
import EmployeeList from './pages/EmployeeList';
import DepartmentManager from './pages/DepartmentManager';
import AdminLeaveManager from './pages/AdminLeaveManager'; 
import AdminAttendanceManager from './pages/AdminAttendanceManager';
import AdminPayrollManager from './pages/AdminPayrollManager'; // <-- NEW PAYROLL IMPORT

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/" element={<Login />} />
        
        {/* Parent Admin Route (The Layout with the Sidebar) */}
        <Route path="/admin" element={<AdminDashboard />}>
            
            {/* Child Routes that inject into the Admin Outlet */}
            <Route index element={<AdminOverview />} /> 
            <Route path="employees" element={<EmployeeList />} />
            <Route path="departments" element={<DepartmentManager />} />
            <Route path="leaves" element={<AdminLeaveManager />} /> 
            <Route path="attendance" element={<AdminAttendanceManager />} /> 
            
            {/* <-- SAFELY NESTED PAYROLL ROUTE --> */}
            <Route path="payroll" element={<AdminPayrollManager />} /> 
            
        </Route>

        {/* Employee Dashboard Placeholder */}
        <Route path="/employee-dashboard" element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4 text-green-700">Employee Self-Service Portal</h1>
            <p className="text-gray-500">Under Construction...</p>
          </div>
        } />

        {/* The Catch-All Route (Safety Net) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;