import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, Info } from 'lucide-react';

const AttendancePage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for our sleek on-screen notifications
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/attendance/my-attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // NEW: Helper function to show notifications that disappear after 3 seconds
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handlePunch = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'in' ? 'punch-in' : 'punch-out';
      const method = type === 'in' ? axios.post : axios.put;
      
      const res = await method(`${import.meta.env.VITE_API_URL}/attendance/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showNotification(res.data.message, 'success');
      fetchHistory(); 
    } catch (err) {
      showNotification(err.response?.data?.error || "Action failed.", 'error');
    }
  };

  // Determine current status based on the most recent history record
const today = new Date().toISOString().split('T')[0];

const todayRecord = history.find(r =>
  r.punch_in && r.punch_in.startsWith(today)
);

const isCurrentlyWorking = todayRecord && todayRecord.punch_out === null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Time & Attendance</h1>
        
        {/* Sleek Notification Badge */}
        {notification.show && (
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            <Info size={16} />
            {notification.message}
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex flex-col items-center justify-center text-center">
          <Clock size={32} className={`mb-3 ${isCurrentlyWorking ? 'text-gray-300' : 'text-emerald-600'}`} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Starting your shift?</h3>
          <button 
            onClick={() => handlePunch('in')}
            disabled={isCurrentlyWorking}
            className={`w-full py-2 rounded-lg font-medium transition-colors ${
              isCurrentlyWorking 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isCurrentlyWorking ? 'Already Checked In' : 'Punch In'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex flex-col items-center justify-center text-center">
          <CheckCircle size={32} className={`mb-3 ${!isCurrentlyWorking ? 'text-gray-300' : 'text-blue-600'}`} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Ending your shift?</h3>
          <button 
            onClick={() => handlePunch('out')}
            disabled={!isCurrentlyWorking}
            className={`w-full py-2 rounded-lg font-medium transition-colors ${
              !isCurrentlyWorking 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {!isCurrentlyWorking ? 'Not Checked In' : 'Punch Out'}
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-bold text-gray-700">Recent Logs</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading your logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-600 uppercase border-b border-gray-200">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Punch In</th>
                  <th className="p-4 font-semibold">Punch Out</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-gray-500">No attendance records found.</td></tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-900 font-medium">
                        {new Date(record.punch_in).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-emerald-600 font-medium">
                        {new Date(record.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-blue-600 font-medium">
                        {record.punch_out ? new Date(record.punch_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active Shift'}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${record.punch_out === null ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                          {record.punch_out === null ? 'Working' : 'Completed'}
                        </span>
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

export default AttendancePage;