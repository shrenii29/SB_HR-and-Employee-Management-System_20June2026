import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Building2, Plus, Trash2, Users, CalendarOff, Info } from 'lucide-react';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null); 
  
  const [newDeptName, setNewDeptName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [deptRes, empRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/departments`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/employees`, { headers })
      ]);

      setDepartments(deptRes.data);
      setEmployees(empRes.data);
      
      // FIX: Use a functional update to remove `selectedDept` from the dependency array.
      // This stops React from re-fetching from the database every time you click a card!
      setSelectedDept(prevSelected => {
        if (!prevSelected) return null;
        return deptRes.data.find(d => d.id === prevSelected.id) || null;
      });
      
    } catch (err) {
      setError('Failed to load department data.');
    } finally {
      setLoading(false);
    }
  }, []); // <-- FIX: This array is now empty, stopping the lag loop.

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/departments`, 
        { name: newDeptName }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewDeptName(''); 
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add department');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm('Delete this department? Employees in it will be marked "Unassigned".')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedDept(prev => prev?.id === id ? null : prev);
      fetchData();
    } catch (err) {
      alert('Failed to delete department.');
    }
  };

  const getDeptStats = (deptId) => {
    const deptEmployees = employees.filter(emp => emp.department_id === deptId);
    return {
      total: deptEmployees.length,
      onLeave: 0
    };
  };

  return (
    <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div className="lg:col-span-1 space-y-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Building2 size={24} />
            <h2 className="text-xl font-bold text-gray-800">New Department</h2>
          </div>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div>
              <input 
                type="text" required placeholder="e.g. HR, Engineering"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span className="font-medium">Add Department</span>
            </button>
          </form>
        </div>

        {selectedDept ? (
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 text-white animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl">
                {selectedDept.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedDept.name}</h3>
                <p className="text-sm text-slate-400">Department Snapshot</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 text-slate-300">
                  <Users size={18} className="text-blue-400" />
                  <span>Total Employees</span>
                </div>
                <span className="text-xl font-bold text-white">{getDeptStats(selectedDept.id).total}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 text-slate-300">
                  <CalendarOff size={18} className="text-orange-400" />
                  <span>Currently on Leave</span>
                </div>
                <span className="text-xl font-bold text-white">{getDeptStats(selectedDept.id).onLeave}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center h-48 text-gray-500">
            <Info size={32} className="mb-2 text-gray-400" />
            <p>Select a department from the list to view its analytics.</p>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-12rem)] flex flex-col">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Active Departments</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="p-8 text-center text-gray-500">Loading...</div>}
            {error && <div className="p-4 m-6 text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

            {!loading && !error && (
              <ul className="divide-y divide-gray-100">
                {departments.length === 0 ? (
                  <li className="p-8 text-center text-gray-500 italic">No departments created yet.</li>
                ) : (
                  departments.map(dept => (
                    <li 
                      key={dept.id} 
                      onClick={() => setSelectedDept(dept)}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                        selectedDept?.id === dept.id 
                          ? 'bg-blue-50 border-l-4 border-blue-600' 
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                          selectedDept?.id === dept.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {dept.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 text-lg block">{dept.name}</span>
                          <span className="text-xs text-gray-500">ID: DEPT-{dept.id}</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleDelete(e, dept.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DepartmentManager;