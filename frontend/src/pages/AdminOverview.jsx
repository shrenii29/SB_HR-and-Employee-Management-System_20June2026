import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Building2, CalendarOff } from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    pendingLeaves: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        
        const [empRes, deptRes, leaveRes] = await Promise.all([
  axios.get(`${import.meta.env.VITE_API_URL}/employees`, { headers }),
  axios.get(`${import.meta.env.VITE_API_URL}/departments`, { headers }),
  axios.get(`${import.meta.env.VITE_API_URL}/leave/pending-count`, { headers })
]);

setStats({
  employees: empRes.data.length,
  departments: deptRes.data.length,
  pendingLeaves: leaveRes.data.pending || 0
});
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500 font-medium">Loading dashboard analytics...</div>;
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-800">Dashboard Analytics</h2>
      
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        {}
        <div className="flex items-center p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="p-4 mr-4 text-blue-600 bg-blue-100 rounded-full">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Employees</p>
            <p className="text-3xl font-bold text-gray-900">{stats.employees}</p>
          </div>
        </div>

        {}
        <div className="flex items-center p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="p-4 mr-4 text-purple-600 bg-purple-100 rounded-full">
            <Building2 size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Departments</p>
            <p className="text-3xl font-bold text-gray-900">{stats.departments}</p>
          </div>
        </div>

        {}
        <div className="flex items-center p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="p-4 mr-4 text-orange-600 bg-orange-100 rounded-full">
            <CalendarOff size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Leaves</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingLeaves}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;