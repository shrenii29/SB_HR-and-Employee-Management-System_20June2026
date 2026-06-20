import { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, CalendarDays, IndianRupee } from 'lucide-react';
import { Outlet } from 'react-router-dom';


const EmployeeDashboard = () => {
  const [leaveData, setLeaveData] = useState({ remaining: 0 });
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // -------- LEAVES --------
        try {
          const leaveRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/leave/my-leave-summary`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setLeaveData(leaveRes.data || { remaining: 0 });
        } catch (err) {
          console.error("Leave API failed", err);
        }

        // -------- ATTENDANCE --------
        try {
          const attRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/attendance/my-attendance`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const data = Array.isArray(attRes.data) ? attRes.data : [];
          const today = new Date().toISOString().split('T')[0];

          const todayRecord = data.find(r =>
            r.punch_in && r.punch_in.startsWith(today)
          );

          setIsWorking(!!todayRecord && todayRecord.punch_out === null);
        } catch (err) {
          console.error("Attendance API failed", err);
        }

      } catch (err) {
        console.error("Dashboard error", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* STATUS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Clock size={24}/>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-xl font-bold text-gray-800">
              {isWorking ? 'Checked In' : 'Not Checked In'}
            </p>
          </div>
        </div>

        {/* LEAVES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <CalendarDays size={24}/>
          </div>
          <div>
            <p className="text-sm text-gray-500">Leaves Available</p>
            <p className="text-xl font-bold text-gray-800">
              {leaveData?.remaining ?? 0} Days
            </p>
          </div>
        </div>

        {/* PAYDAY */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <IndianRupee size={24}/>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Payday</p>
            <p className="text-xl font-bold text-gray-800">1st of Month</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;