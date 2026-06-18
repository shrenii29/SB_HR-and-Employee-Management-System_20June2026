import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { UserPlus, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // --- NEW: Inline Error State ---
  const [fieldErrors, setFieldErrors] = useState({});
  
  const initialFormState = {
    first_name: '', last_name: '', email: '', password: '', 
    phone_number: '', role: 'Employee', department_id: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [empRes, deptRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/employees`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/departments`, { headers })
      ]);

      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      setError('Failed to load system data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/employees/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (err) {
      alert('Failed to delete employee.'); // Kept as standard alert for destructive actions
    }
  };

  const openEditModal = (employee) => {
    setEditingId(employee.id);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone_number: employee.phone_number || '',
      role: employee.role || 'Employee',
      department_id: employee.department_id || '',
      password: ''
    });
    setShowPassword(false);
    setFieldErrors({}); // Clear errors when opening
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowPassword(false);
    setFieldErrors({}); // Clear errors when opening
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({}); // Reset errors on new submission
    
    // Client-side validation
    let currentErrors = {};
    if (formData.phone_number && formData.phone_number.length !== 10) {
        currentErrors.phone_number = "Must be exactly 10 digits.";
    }

    // Stop submission if client validation fails
    if (Object.keys(currentErrors).length > 0) {
        setFieldErrors(currentErrors);
        return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = { ...formData };
      if (!payload.department_id) payload.department_id = null;

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/employees/${editingId}`, payload, { headers });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, payload, { headers });
      }

      setIsModalOpen(false);
      fetchData(); 
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Action failed.';
      
      // Map backend errors to specific fields based on text
      if (errorMsg.toLowerCase().includes('email')) {
        setFieldErrors({ email: errorMsg });
      } else {
        // Fallback for general errors (e.g., server down)
        setFieldErrors({ general: errorMsg });
      }
    }
  };

  const getDeptName = (id) => {
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : 'Unassigned';
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <h2 className="text-xl font-bold text-gray-800">Employee Directory</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
        >
          <UserPlus size={18} />
          <span className="font-medium">Add Employee</span>
        </button>
      </div>

      {loading && <div className="p-8 text-center text-gray-500">Loading directory...</div>}
      {error && <div className="p-4 m-6 text-red-700 border border-red-200 rounded-lg bg-red-50">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm tracking-wider text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                <th className="p-4 font-semibold">Name & Role</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr><td colSpan="4" className="p-8 italic text-center text-gray-500">No employees found.</td></tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="transition-colors hover:bg-blue-50/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{employee.first_name} {employee.last_name}</div>
                      <div className="text-xs font-semibold text-blue-600 mt-0.5">ID: EMP-{employee.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800">{employee.email}</div>
                      <div className="text-xs text-gray-500">{employee.phone_number || 'No phone added'}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                        {getDeptName(employee.department_id)}
                      </span>
                    </td>
                    <td className="flex justify-end gap-3 p-4">
                      <button onClick={() => openEditModal(employee)} className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-100">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(employee.id)} className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-100">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg p-6 bg-white shadow-2xl rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Employee Record' : 'Onboard New Employee'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* General form errors (e.g., Network issues) */}
            {fieldErrors.general && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
                {fieldErrors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" required 
                    className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    value={formData.email} onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      // Clear the specific error when user starts typing again
                      if (fieldErrors.email) setFieldErrors({...fieldErrors, email: null});
                    }} 
                  />
                  {/* Inline Email Error */}
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Mobile Number</label>
                  <input type="tel" maxLength="10" placeholder="10-digit number"
                    className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.phone_number ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    value={formData.phone_number} 
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, phone_number: numericValue});
                      if (fieldErrors.phone_number) setFieldErrors({...fieldErrors, phone_number: null});
                    }} 
                  />
                  {/* Inline Phone Error */}
                  {fieldErrors.phone_number && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone_number}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">System Role</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="Employee">Employee</option>
                    <option value="Admin">HR Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Department</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})}>
                    <option value="">Unassigned</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingId && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Temporary Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required minLength="6" 
                      className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 mt-6 border-t border-gray-100 gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  {editingId ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;