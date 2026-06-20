import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';

const AdminAttendanceManager = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  
  const [dateFilter, setDateFilter] = useState(new Date().toLocaleDateString('en-CA'));

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/attendance/all`, { headers });
      setAttendance(res.data);
    } catch (err) {
      setError('Failed to load organization attendance records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusBadge = (status, punchOut) => {
    if (!punchOut) {
       return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full w-fit"><Clock size={14}/> Active Shift</span>;
    }
    switch (status?.toLowerCase()) {
      case 'present':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full w-fit"><CheckCircle2 size={14}/> Completed</span>;
      case 'absent':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full w-fit"><XCircle size={14}/> Absent</span>;
      case 'late':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full w-fit"><Clock size={14}/> Late</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full w-fit">{status || 'N/A'}</span>;
    }
  };

  
  const filteredAttendance = attendance.filter(record => {
    if (!record.punch_in) return false;
    
    const recordDate = new Date(record.punch_in).toLocaleDateString('en-CA');
    return recordDate === dateFilter;
  });

  
  const stats = {
    present: filteredAttendance.filter(r => r.punch_out !== null).length,
    active: filteredAttendance.filter(r => r.punch_out === null).length,
    total: filteredAttendance.length
  };

  return (
    <div className="space-y-6">
      
      {}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <ClipboardCheck className="text-blue-500" />
            Daily Attendance Log
          </h2>
          <p className="mt-1 text-sm text-gray-500">Monitor employee presence and working hours.</p>
        </div>
        
        <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Calendar size={18} className="text-gray-400" />
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
          />
        </div>
      </div>

      {}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col items-center p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <span className="font-medium text-gray-500 text-sm">Active Now</span>
          <span className="text-2xl font-bold text-yellow-600">{stats.active}</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <span className="font-medium text-gray-500 text-sm">Completed Shifts</span>
          <span className="text-2xl font-bold text-green-600">{stats.present}</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <span className="font-medium text-gray-500 text-sm">Total Punches Today</span>
          <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
        </div>
      </div>

      {}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
        {loading && <div className="p-8 text-center text-gray-500">Loading records...</div>}
        {error && <div className="p-4 m-6 text-red-700 border border-red-200 rounded-lg bg-red-50">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm tracking-wider text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Punch In</th>
                  <th className="p-4 font-semibold">Punch Out</th>
                  <th className="p-4 font-semibold">Total Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 italic text-center text-gray-500">
                      No attendance records found for {new Date(dateFilter).toLocaleDateString()}.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => {
                    
                    let totalHours = '-';
                    if (record.punch_in && record.punch_out) {
                      const diffInMs = new Date(record.punch_out) - new Date(record.punch_in);
                      totalHours = (diffInMs / (1000 * 60 * 60)).toFixed(2) + ' hrs';
                    }

                    return (
                      <tr key={record.id} className="transition-colors hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{record.first_name} {record.last_name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">EMP-{record.user_id}</div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(record.status, record.punch_out)}
                        </td>
                        <td className="p-4 text-sm font-medium text-emerald-600">
                          {new Date(record.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-sm font-medium text-blue-600">
                          {record.punch_out 
                            ? new Date(record.punch_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : '--:--'
                          }
                        </td>
                        <td className="p-4 font-semibold text-sm text-gray-800">
                          {totalHours}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceManager;