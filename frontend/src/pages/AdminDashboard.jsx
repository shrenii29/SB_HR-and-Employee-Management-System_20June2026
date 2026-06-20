import { useState, useEffect } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { 
  Users, Building2, CalendarOff, ClipboardCheck, 
  CreditCard, LogOut, LayoutDashboard 
} from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navLinkClasses = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {}
      <aside className="w-64 flex flex-col shadow-xl bg-slate-900 text-white hidden md:flex">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold tracking-wider text-blue-400">HR PORTAL</h2>
          <p className="mt-1 text-sm text-slate-400">Admin Workspace</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavLink to="/admin" end className={navLinkClasses}>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>
          
          <NavLink to="/admin/employees" className={navLinkClasses}>
            <Users size={20} />
            <span>Employees</span>
          </NavLink>
          
          <NavLink to="/admin/departments" className={navLinkClasses}>
            <Building2 size={20} />
            <span>Departments</span>
          </NavLink>
          
          <NavLink to="/admin/leaves" className={navLinkClasses}>
            <CalendarOff size={20} />
            <span>Leave Requests</span>
          </NavLink>
          
          <NavLink to="/admin/attendance" className={navLinkClasses}>
            <ClipboardCheck size={20} />
            <span>Attendance</span>
          </NavLink>

          {}
          <NavLink to="/admin/payroll" className={navLinkClasses}>
            <CreditCard size={20} />
            <span>Payroll</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="flex items-center justify-center w-8 h-8 font-bold bg-blue-600 rounded-full">
              {user.first_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.first_name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-2 text-red-400 transition-colors rounded-lg hover:bg-slate-800"
          >
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {}
      <main className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
        </header>
        
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;