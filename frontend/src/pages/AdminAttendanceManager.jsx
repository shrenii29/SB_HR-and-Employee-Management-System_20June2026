import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';

const AdminAttendanceManager = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Default filter to today's date (YYYY-MM-DD format for input)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [attRes, empRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/attendance`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/employees`, { headers })
      ]);

      setAttendance(attRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setError('Failed to load attendance records. Ensure your backend /attendance endpoint is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown Employee';
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full w-fit"><CheckCircle2 size={14}/> Present</span>;
      case 'absent':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full w-fit"><XCircle size={14}/> Absent</span>;
      case 'late':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full w-fit"><Clock size={14}/> Late</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full w-fit">{status || 'N/A'}</span>;
    }
  };

  // Filter records by the selected date
  const filteredAttendance = attendance.filter(record => {
    if (!record.date) return false;
    // Extract just the YYYY-MM-DD part from the database timestamp
    const recordDate = new Date(record.date).toISOString().split('T')[0];
    return recordDate === dateFilter;
  });

  // Calculate quick stats for the day
  const stats = {
    present: filteredAttendance.filter(r => r.status?.toLowerCase() === 'present').length,
    absent: filteredAttendance.filter(r => r.status?.toLowerCase() === 'absent').length,
    late: filteredAttendance.filter(r => r.status?.toLowerCase() === 'late').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Date Picker */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardCheck className="text-blue-500" />
            Daily Attendance Log
          </h2>
          <p className="text-gray-500 text-sm mt-1">Monitor employee presence and working hours.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm p-2">
          <Calendar size={18} className="text-gray-400" />
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm font-medium text-gray-700 outline-none bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* Daily Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
          <span className="text-sm text-gray-500 font-medium">Present</span>
          <span className="text-2xl font-bold text-green-600">{stats.present}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
          <span className="text-sm text-gray-500 font-medium">Late</span>
          <span className="text-2xl font-bold text-orange-600">{stats.late}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
          <span className="text-sm text-gray-500 font-medium">Absent</span>
          <span className="text-2xl font-bold text-red-600">{stats.absent}</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
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
                    <td colSpan="5" className="p-8 text-center text-gray-500 italic">
                      No attendance records found for {new Date(dateFilter).toLocaleDateString()}.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{getEmployeeName(record.employee_id)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">EMP-{record.employee_id}</div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-medium">
                        {record.check_in ? new Date(`1970-01-01T${record.check_in}Z`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-medium">
                        {record.check_out ? new Date(`1970-01-01T${record.check_out}Z`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                      </td>
                      <td className="p-4 text-sm text-gray-800 font-semibold">
                        {/* Assuming your backend calculates hours or provides a default, otherwise placeholder */}
                        {record.total_hours ? `${record.total_hours} hrs` : '-'}
                      </td>
                    </tr>
                  ))
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