import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Building2, Plus, Trash2, Edit2, Save, X, Users, CalendarOff } from 'lucide-react';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newDeptName, setNewDeptName] = useState('');
  const [renameValue, setRenameValue] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: 'Bearer ' + token };
      const [deptRes, empRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/departments`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/employees`, { headers })
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
    } catch (err) { console.error("Fetch failed"); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  
  const getDeptStats = (deptId) => {
    const deptEmployees = employees.filter(e => e.department_id === deptId);
    return {
      total: deptEmployees.length,
      onLeave: 0 
    };
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    await axios.post(`${import.meta.env.VITE_API_URL}/departments`, { name: newDeptName }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
    setNewDeptName(''); fetchData();
  };

  const handleUpdate = async () => {
    await axios.put(`${import.meta.env.VITE_API_URL}/departments/${selectedDept.id}`, { name: renameValue }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
    setIsEditing(false);
    fetchData();
  };

  const assignEmployee = async (empId) => {
    await axios.put(`${import.meta.env.VITE_API_URL}/employees/${empId}`, { department_id: selectedDept.id }, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
    fetchData();
  };

  return (
    <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={18}/> New Department</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <input className="w-full p-2 border rounded-md" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="e.g. Sales, Marketing" />
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">Add Department</button>
          </form>
        </div>

        {selectedDept ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
            {}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <Users className="text-blue-600 mx-auto mb-1" size={20}/>
                <p className="text-xs text-gray-500 uppercase font-bold">Total Staff</p>
                <p className="text-xl font-bold text-gray-800">{getDeptStats(selectedDept.id).total}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <CalendarOff className="text-orange-600 mx-auto mb-1" size={20}/>
                <p className="text-xs text-gray-500 uppercase font-bold">On Leave</p>
                <p className="text-xl font-bold text-gray-800">{getDeptStats(selectedDept.id).onLeave}</p>
              </div>
            </div>

            {}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm uppercase">{selectedDept.name}</h3>
              {!isEditing && <button onClick={() => { setIsEditing(true); setRenameValue(selectedDept.name); }} className="text-blue-600"><Edit2 size={16}/></button>}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <input className="w-full p-2 border rounded" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="flex-1 bg-green-600 text-white py-2 rounded"><Save size={16}/></button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 py-2 rounded"><X size={16}/></button>
                </div>
              </div>
            ) : (
              <select className="w-full p-2 border rounded text-sm" onChange={(e) => assignEmployee(e.target.value)}>
                <option value="">+ Assign New Staff</option>
                {employees.filter(e => e.department_id !== selectedDept.id).map(e => (
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-center p-6 bg-gray-50 rounded-xl border-2 border-dashed">Select a department to view analytics.</div>
        )}
      </div>

      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gray-50 font-bold text-gray-800 flex items-center gap-2"><Building2 size={18}/> Active Departments</div>
        <ul className="divide-y">
          {departments.map(dept => (
      <li key={dept.id} 
          onClick={() => { setSelectedDept(dept); setIsEditing(false); }} 
          className={`px-6 py-4 cursor-pointer transition-colors flex justify-between items-center ${
            selectedDept?.id === dept.id 
              ? 'bg-blue-50 border-l-4 border-blue-600' 
              : 'hover:bg-gray-50 border-l-4 border-transparent' 
          }`}>
        <span className="font-medium text-gray-700">{dept.name}</span>
        <button 
          onClick={(e) => { e.stopPropagation();  }}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18}/>
        </button>
      </li>
    ))}
        </ul>
      </div>
    </div>
  );
};
export default DepartmentManager;