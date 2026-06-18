import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all your pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminOverview from './pages/AdminOverview';
import EmployeeList from './pages/EmployeeList';
import DepartmentManager from './pages/DepartmentManager';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Parent Admin Route */}
        <Route path="/admin" element={<AdminDashboard />}>
            
            {/* These components inject into the <Outlet /> */}
            <Route index element={<AdminOverview />} /> 
            <Route path="employees" element={<EmployeeList />} />
            <Route path="departments" element={<DepartmentManager />} /> {/* Placeholder replaced! */}
            
            {/* Placeholders for future features */}
            <Route path="leaves" element={
              <div className="p-8 text-xl font-bold text-gray-400 border-4 border-dashed rounded-xl">Leave Module Coming Soon...</div>
            } />
            <Route path="attendance" element={
              <div className="p-8 text-xl font-bold text-gray-400 border-4 border-dashed rounded-xl">Attendance Module Coming Soon...</div>
            } />
        </Route>

        <Route path="/employee-dashboard" element={
          <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-green-700 bg-gray-100">
            Employee Dashboard Coming Soon...
          </div>
        } />

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;