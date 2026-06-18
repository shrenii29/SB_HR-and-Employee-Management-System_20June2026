import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EMPTY = {
  email:'', password:'', first_name:'', last_name:'', phone:'',
  department_id:'', designation:'', date_of_joining:'', date_of_birth:'',
  gender:'', address:'', city:'', state:'', pincode:'',
  emergency_contact_name:'', emergency_contact_phone:'', emergency_contact_relation:'',
};

export default function AdminEmployees() {
  const [employees,   setEmployees]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, page: 1, totalPages: 1 });
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState({ open: false, type: '', data: null });
  const [form,        setForm]        = useState(EMPTY);
  const [saving,      setSaving]      = useState(false);

  const fetchEmployees = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees', { params: { search, page, limit: 10 } });
      setEmployees(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  useEffect(() => {
    api.get('/departments').then((r) => setDepartments(r.data.data)).catch(() => {});
  }, []);

  const openAdd  = () => { setForm(EMPTY); setModal({ open: true, type: 'add' }); };
  const openEdit = (emp) => {
    setForm({ ...EMPTY, ...emp, password: '' });
    setModal({ open: true, type: 'edit', data: emp });
  };
  const closeModal = () => setModal({ open: false, type: '', data: null });

  const handleSave = async () => {
    if (!form.email || !form.first_name || !form.last_name) {
      toast.error('Email, first name and last name are required'); return;
    }
    setSaving(true);
    try {
      if (modal.type === 'add') {
        await api.post('/employees', form);
        toast.success('Employee added');
      } else {
        await api.put(`/employees/${modal.data.id}`, form);
        toast.success('Employee updated');
      }
      closeModal();
      fetchEmployees(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (emp) => {
    if (!confirm(`Delete ${emp.first_name} ${emp.last_name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/employees/${emp.id}`);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const f = (key) => ({ value: form[key] || '', onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 text-sm">{pagination.total} total records</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          className="input-field max-w-sm"
          placeholder="Search by name, code, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Code','Name','Email','Department','Designation','Status','Actions'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading…</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No employees found</td></tr>
              ) : employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-mono text-xs">{emp.employee_code}</td>
                  <td className="table-cell font-medium">{emp.first_name} {emp.last_name}</td>
                  <td className="table-cell text-gray-500">{emp.email}</td>
                  <td className="table-cell">{emp.department_name || '—'}</td>
                  <td className="table-cell">{emp.designation || '—'}</td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${emp.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(emp)} className="text-primary-600 hover:text-primary-800 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(emp)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchEmployees(pagination.page - 1)} className="btn-secondary text-sm py-1 px-3 disabled:opacity-40">Prev</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchEmployees(pagination.page + 1)} className="btn-secondary text-sm py-1 px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">{modal.type === 'add' ? 'Add Employee' : 'Edit Employee'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personal Info */}
              <div className="sm:col-span-2"><h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Personal Info</h3></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input className="input-field" {...f('first_name')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input className="input-field" {...f('last_name')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" className="input-field" {...f('email')} disabled={modal.type === 'edit'} />
              </div>
              {modal.type === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" className="input-field" placeholder="Default: Employee@123" {...f('password')} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input className="input-field" {...f('phone')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select className="input-field" {...f('gender')}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" className="input-field" {...f('date_of_birth')} />
              </div>

              {/* Job Info */}
              <div className="sm:col-span-2 pt-2"><h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Job Info</h3></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select className="input-field" value={form.department_id || ''} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                  <option value="">None</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input className="input-field" {...f('designation')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                <input type="date" className="input-field" {...f('date_of_joining')} />
              </div>

              {/* Address */}
              <div className="sm:col-span-2 pt-2"><h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Address</h3></div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input className="input-field" {...f('address')} />
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input className="input-field" {...f('city')} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">State</label><input className="input-field" {...f('state')} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label><input className="input-field" {...f('pincode')} /></div>

              {/* Emergency */}
              <div className="sm:col-span-2 pt-2"><h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Emergency Contact</h3></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input className="input-field" {...f('emergency_contact_name')} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input className="input-field" {...f('emergency_contact_phone')} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Relation</label><input className="input-field" {...f('emergency_contact_relation')} /></div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : modal.type === 'add' ? 'Add Employee' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}