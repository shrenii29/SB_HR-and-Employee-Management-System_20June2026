import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState({ open: false, type: '', data: null });
  const [form, setForm]               = useState({ name: '', description: '' });
  const [saving, setSaving]           = useState(false);
  const [detail, setDetail]           = useState(null);

  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);

  const openAdd  = () => { setForm({ name: '', description: '' }); setModal({ open: true, type: 'add' }); };
  const openEdit = (d) => { setForm({ name: d.name, description: d.description || '' }); setModal({ open: true, type: 'edit', data: d }); };
  const openView = async (d) => {
    try {
      const { data } = await api.get(`/departments/${d.id}`);
      setDetail(data.data);
    } catch { toast.error('Failed to load details'); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Department name is required'); return; }
    setSaving(true);
    try {
      if (modal.type === 'add') {
        await api.post('/departments', form);
        toast.success('Department created');
      } else {
        await api.put(`/departments/${modal.data.id}`, form);
        toast.success('Department updated');
      }
      setModal({ open: false, type: '', data: null });
      fetchDepts();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (d) => {
    if (!confirm(`Delete department "${d.name}"?`)) return;
    try {
      await api.delete(`/departments/${d.id}`);
      toast.success('Department deleted');
      fetchDepts();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 text-sm">{departments.length} departments</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ New Department</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-xl">🏢</div>
                <div className="flex gap-2">
                  <button onClick={() => openView(d)} className="text-xs text-gray-500 hover:text-primary-600">View</button>
                  <button onClick={() => openEdit(d)} className="text-xs text-primary-600 hover:text-primary-800">Edit</button>
                  <button onClick={() => handleDelete(d)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">{d.name}</h3>
              {d.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{d.description}</p>}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500">
                  👥 {d.employee_count} employee{d.employee_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
          {!departments.length && (
            <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-gray-400">
              No departments yet. Create your first one.
            </div>
          )}
        </div>
      )}

      {/* Add/Edit modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{modal.type === 'add' ? 'New Department' : 'Edit Department'}</h2>
              <button onClick={() => setModal({ open: false, type: '', data: null })} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Engineering" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} className="input-field resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description…" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setModal({ open: false, type: '', data: null })} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{detail.name}</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6">
              {detail.description && <p className="text-gray-600 mb-4">{detail.description}</p>}
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Employees ({detail.employees?.length || 0})</h3>
              {detail.employees?.length ? (
                <div className="space-y-2">
                  {detail.employees.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">
                        {e.first_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{e.first_name} {e.last_name}</p>
                        <p className="text-xs text-gray-500">{e.designation || '—'} · {e.employee_code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-sm">No employees assigned</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}