import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CalendarDays, FileText, Info, Clock, CheckCircle2, XCircle } from 'lucide-react';

const EmployeeLeave = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  
  const [formData, setFormData] = useState({
    leave_type: 'Sick',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/leave/my-leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch leave history", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const submitLeave = async (e) => {
    e.preventDefault();
    
    
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      showNotification("End date cannot be before start date.", "error");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/leave/apply`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showNotification(res.data.message, 'success');
      
      
      setFormData({ leave_type: 'Sick', start_date: '', end_date: '', reason: '' });
      
      
      fetchHistory();
    } catch (err) {
      showNotification(err.response?.data?.error || "Failed to submit leave.", 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full w-fit"><CheckCircle2 size={14}/> Approved</span>;
      case 'Rejected':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full w-fit"><XCircle size={14}/> Rejected</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full w-fit"><Clock size={14}/> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        
        {notification.show && (
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            <Info size={16} />
            {notification.message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {}
        <div className="lg:col-span-1">
          <form onSubmit={submitLeave} className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h2 className="flex items-center gap-2 mb-6 text-lg font-bold text-gray-800">
              <CalendarDays className="text-blue-500" />
              Request Time Off
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Leave Type</label>
                <select 
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.leave_type}
                  onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Earned">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Start Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">End Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Reason</label>
                <textarea 
                  required
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                  placeholder="Briefly explain your reason..." 
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})} 
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>

        {}
        <div className="lg:col-span-2">
          <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
              <FileText className="text-gray-500" size={20} />
              <h2 className="font-bold text-gray-700">My Leave History</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading your records...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-sm tracking-wider text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Duration</th>
                      <th className="p-4 font-semibold">Reason</th>
                      <th className="p-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 italic text-center text-gray-500">No leave requests found.</td></tr>
                    ) : (
                      history.map((record) => (
                        <tr key={record.id} className="transition-colors hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">
                            {record.leave_type}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {new Date(record.start_date).toLocaleDateString()} <br/> 
                            <span className="text-xs text-gray-400">to</span> <br/>
                            {new Date(record.end_date).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate" title={record.reason}>
                            {record.reason}
                          </td>
                          <td className="flex justify-end p-4">
                            {getStatusBadge(record.status)}
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

      </div>
    </div>
  );
};

export default EmployeeLeave;