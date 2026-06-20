import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CalendarDays, CheckCircle, XCircle, Clock, Info } from 'lucide-react';

const AdminLeaveManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/leave/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      setError('Failed to load leave requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/leave/update-status/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showNotification(`Request marked as ${newStatus}`);
      fetchRequests(); 
    } catch (err) {
      showNotification("Failed to update status", 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full w-fit"><CheckCircle size={14}/> Approved</span>;
      case 'Rejected':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full w-fit"><XCircle size={14}/> Rejected</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full w-fit"><Clock size={14}/> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <CalendarDays className="text-blue-500" />
            Leave Requests Inbox
          </h2>
          <p className="mt-1 text-sm text-gray-500">Review and manage employee time-off requests.</p>
        </div>

        {notification.show && (
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            <Info size={16} />
            {notification.message}
          </div>
        )}
      </div>

      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
        {loading && <div className="p-8 text-center text-gray-500">Loading requests...</div>}
        {error && <div className="p-4 m-6 text-red-700 border border-red-200 rounded-lg bg-red-50">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm tracking-wider text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Leave Details</th>
                  <th className="p-4 font-semibold">Reason</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 italic text-center text-gray-500">
                      No leave requests found in the system.
                    </td>
                  </tr>
                ) : (
                  requests.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{record.first_name} {record.last_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">EMP-{record.user_id}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-blue-600">{record.leave_type} Leave</div>
                        <div className="mt-1 text-sm text-gray-500">
                          {new Date(record.start_date).toLocaleDateString()} &rarr; {new Date(record.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate" title={record.reason}>
                        {record.reason}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="p-4 text-right">
                        {}
                        {record.status === 'Pending' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(record.id, 'Approved')}
                              className="px-3 py-1.5 text-sm font-medium text-white transition-colors bg-emerald-600 rounded-lg hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(record.id, 'Rejected')}
                              className="px-3 py-1.5 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Processed</span>
                        )}
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

export default AdminLeaveManager;