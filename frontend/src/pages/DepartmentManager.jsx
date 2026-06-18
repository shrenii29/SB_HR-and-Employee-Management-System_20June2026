import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Plus, Trash2 } from 'lucide-react';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/departments`, 
        { name: newDeptName }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewDeptName(''); // Clear input
      fetchDepartments(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? Employees in it will be marked "Unassigned".')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(departments.filter(dept => dept.id !== id));
    } catch (err) {
      alert('Failed to delete department.');
    }
  };

  return (
    <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Create Department Card */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Building2 size={24} />
            <h2 className="text-xl font-bold text-gray-800">New Department</h2>
          </div>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
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
      </div>

      {/* Department List Card */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Active Departments</h2>
          </div>
          
          {loading && <div className="p-8 text-center text-gray-500">Loading...</div>}
          {error && <div className="p-4 m-6 text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

          {!loading && !error && (
            <ul className="divide-y divide-gray-100">
              {departments.length === 0 ? (
                <li className="p-8 text-center text-gray-500 italic">No departments created yet.</li>
              ) : (
                departments.map(dept => (
                  <li key={dept.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {dept.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-800 text-lg">{dept.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(dept.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
  );
};

export default DepartmentManager;