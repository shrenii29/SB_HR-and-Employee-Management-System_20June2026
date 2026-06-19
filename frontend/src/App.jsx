import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminOverview from './pages/AdminOverview';
import EmployeeList from './pages/EmployeeList';
import DepartmentManager from './pages/DepartmentManager';
import AdminLeaveManager from './pages/AdminLeaveManager'; 
import AdminAttendanceManager from './pages/AdminAttendanceManager';
import AdminPayrollManager from './pages/AdminPayrollManager';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeLayout from './pages/EmployeeLayout';
import EmployeeLeave from './pages/EmployeeLeave';     
import EmployeeSalary from './pages/EmployeeSalary';   

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


<Route path="/employee-dashboard" element={<EmployeeLayout />}>
    <Route index element={<EmployeeDashboard />} /> 
    <Route path="attendance" element={<AttendancePage />} />
    <Route path="leaves" element={<EmployeeLeave />} />
    <Route path="salary" element={<EmployeeSalary />} />
  </Route>


        {/* The Catch-All Route (Safety Net) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;