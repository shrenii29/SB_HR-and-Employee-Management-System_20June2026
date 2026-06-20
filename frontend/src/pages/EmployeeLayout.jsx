import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { Home, Clock, Calendar, Wallet, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

const EmployeeLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user'));
    } catch {
      storedUser = null;
    }

    if (!storedToken || !storedUser) {
      navigate('/');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg ${
      isActive ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        
        <h2 className="text-xl font-bold text-emerald-600 mb-8">EmpPortal</h2>

        <nav className="space-y-2">
          <NavLink to="/employee-dashboard" end className={linkClass}>
            <Home size={20}/> Dashboard
          </NavLink>

          <NavLink to="/employee-dashboard/attendance" className={linkClass}>
            <Clock size={20}/> Attendance
          </NavLink>

          <NavLink to="/employee-dashboard/leaves" className={linkClass}>
            <Calendar size={20}/> Leaves
          </NavLink>

          <NavLink to="/employee-dashboard/payroll" className={linkClass}>
            <Wallet size={20}/> Payroll
          </NavLink>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200">
          
          <NavLink 
            to="/employee-dashboard/profile"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
          >
            <div className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-full font-bold">
              {user?.first_name?.charAt(0)}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500">View Profile</p>
            </div>
          </NavLink>

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-red-600 mt-4"
          >
            <LogOut size={18}/> Logout
          </button>
        </div>

      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>

    </div>
  );
};

export default EmployeeLayout;