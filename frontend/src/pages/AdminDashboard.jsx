import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  CalendarOff, 
  ClipboardCheck, 
  CreditCard, 
  LogOut, 
  LayoutDashboard 
} from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check authentication on load
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

  if (!user) return null; // Prevent flicker before redirect

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold tracking-wider text-blue-400">HR PORTAL</h2>
          <p className="text-sm text-slate-400 mt-1">Admin Workspace</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-blue-400 bg-slate-800 rounded-lg transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Overview</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Users size={20} />
            <span className="font-medium">Employees</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Building2 size={20} />
            <span className="font-medium">Departments</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <CalendarOff size={20} />
            <span className="font-medium">Leave Requests</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <ClipboardCheck size={20} />
            <span className="font-medium">Attendance</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <CreditCard size={20} />
            <span className="font-medium">Payroll</span>
          </a>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              {user.first_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.first_name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          {/* We will inject the Analytics Cards here in the next step */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-32 border-dashed border-2 border-gray-300">
               <p className="text-gray-500 font-medium">Total Employees Card</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-32 border-dashed border-2 border-gray-300">
               <p className="text-gray-500 font-medium">Total Departments Card</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-32 border-dashed border-2 border-gray-300">
               <p className="text-gray-500 font-medium">Pending Leaves Card</p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;