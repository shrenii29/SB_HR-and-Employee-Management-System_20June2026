import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CalendarOff, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

const AdminLeaveManager = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'Approved', 'Rejected'

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch both leaves and employees to map names to IDs
      const [leaveRes, empRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/leaves`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/employees`, { headers })
      ]);

      // Sort leaves so 'Pending' ones show up at the top automatically
      const sortedLeaves = leaveRes.data.sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setLeaves(sortedLeaves);
      setEmployees(empRes.data);
    } catch (err) {
      setError('Failed to load leave requests. Ensure your backend /leaves endpoint is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Approve/Reject action
  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this request?`)) return;

    try {
      const token = localStorage.getItem('token');
      // Adjust this URL to match whatever your backend PUT route is named
      await axios.put(`${import.meta.env.VITE_API_URL}/leaves/${id}`, 
        { status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the UI instantly without reloading the page
      setLeaves(leaves.map(leave => 
        leave.id === id ? { ...leave, status: newStatus } : leave
      ));
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${newStatus.toLowerCase()} leave request.`);
    }
  };

  // Helper to get the employee's full name
  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown Employee';
  };

  // Helper for UI styling based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full"><CheckCircle size={14}/> Approved</span>;
      case 'Rejected':
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full"><XCircle size={14}/> Rejected</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full"><Clock size={14}/> Pending</span>;
    }
  };

  // Filter the table data
  const filteredLeaves = filter === 'All' ? leaves : leaves.filter(l => l.status === filter);

  return (
    <div className="space-y-6">
      
      {/* Page Header & Filters */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarOff className="text-orange-500" />
            Leave Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Review and manage employee time-off requests.</p>
        </div>
        
        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm p-1">
          <Filter size={18} className="text-gray-400 mx-2" />
          {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === status ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        {loading && <div className="p-8 text-center text-gray-500">Loading requests...</div>}
        {error && <div className="p-4 m-6 text-red-700 border border-red-200 rounded-lg bg-red-50">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm tracking-wider text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Leave Details</th>
                  <th className="p-4 font-semibold">Dates</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeaves.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 italic text-center text-gray-500">No leave requests found for this filter.</td></tr>
                ) : (
                  filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="transition-colors hover:bg-gray-50">
                      
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{getEmployeeName(leave.employee_id)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">EMP-{leave.employee_id}</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="font-semibold text-blue-600">{leave.leave_type || 'General Leave'}</div>
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                          {leave.reason || 'No reason provided'}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(leave.start_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">to</div>
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(leave.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        {getStatusBadge(leave.status)}
                      </td>
                      
                      <td className="p-4 text-right space-x-2">
                        {leave.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(leave.id, 'Approved')}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(leave.id, 'Rejected')}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                          </>
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