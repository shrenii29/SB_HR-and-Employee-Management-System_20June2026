import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; // NEW

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Actual Admin Route */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        {/* Employee Placeholder */}
        <Route path="/employee-dashboard" element={
          <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-green-700 bg-gray-100">
            Employee Dashboard Coming Soon...
          </div>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;