import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, Clock, Calendar, IndianRupee, LogOut } from 'lucide-react';

const EmployeeLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <h2 className="text-xl font-bold text-emerald-600 mb-8">EmpPortal</h2>
        <nav className="space-y-4">
          <Link to="/employee-dashboard" className="flex items-center gap-3 text-gray-600 hover:text-emerald-600">
            <Home size={20}/> Dashboard
          </Link>
          <Link to="/employee-dashboard/attendance" className="flex items-center gap-3 text-gray-600 hover:text-emerald-600">
            <Clock size={20}/> Attendance
          </Link>
          <Link to="/employee-dashboard/leaves" className="flex items-center gap-3 text-gray-600 hover:text-emerald-600">
            <Calendar size={20}/> Leaves
          </Link>
          <Link to="/employee-dashboard/payroll" className="flex items-center gap-3 text-gray-600 hover:text-emerald-600">
            <Wallet size={20}/> Payroll
          </Link>
          
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 text-red-600 mt-10 w-full text-left"
          >
            <LogOut size={20}/> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <Outlet /> 
      </main>
    </div>
  );
};

export default EmployeeLayout;