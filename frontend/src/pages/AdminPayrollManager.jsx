import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Calculator, IndianRupee, Edit, FileText, X } from 'lucide-react';

const AdminPayrollManager = () => {
  const [employees, setEmployees] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  // Default to the current YYYY-MM
  const currentMonth = new Date().toISOString().slice(0, 7); 
  
  const [formData, setFormData] = useState({
    month_year: currentMonth,
    basic_salary: 0,
    allowances: 0,
    deductions: 0
  });

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const empRes = await axios.get(`${import.meta.env.VITE_API_URL}/employees`, { headers });
      
      try {
        const payRes = await axios.get(`${import.meta.env.VITE_API_URL}/payroll`, { headers });
        setPayrollData(payRes.data);
      } catch (e) {
        setPayrollData([]); 
      }

      setEmployees(empRes.data);
    } catch (err) {
      setError('Failed to load payroll data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Match payroll record to the correct user_id
  const getEmployeePayroll = (empId) => {
    const record = payrollData.find(p => p.user_id === empId || p.employee_id === empId);
    return record || { basic_salary: 0, allowances: 0, deductions: 0 };
  };

  const calculateNetPay = (basic, allowances, deductions) => {
    return (Number(basic) + Number(allowances)) - Number(deductions);
  };

  const openEditModal = (emp) => {
    const currentPay = getEmployeePayroll(emp.id);
    setSelectedEmp(emp);
    setFormData({
      month_year: currentMonth, // Reset to current month when opening
      basic_salary: currentPay.basic_salary || currentPay.base_salary || 0,
      allowances: currentPay.allowances || 0,
      deductions: currentPay.deductions || 0
    });
    setIsModalOpen(true);
  };

  const handleSavePayroll = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // --- THE FIX: Sending EXACTLY what the backend asked for ---
      const payload = {
        user_id: selectedEmp.id,
        month_year: formData.month_year,
        basic_salary: Number(formData.basic_salary),
        allowances: Number(formData.allowances),
        deductions: Number(formData.deductions)
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/payroll`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setIsModalOpen(false);
      fetchData(); // Refresh the table to show new data
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save payroll record.');
    }
  };

  const totalPayrollCost = employees.reduce((acc, emp) => {
    const pay = getEmployeePayroll(emp.id);
    return acc + calculateNetPay(pay.basic_salary || pay.base_salary, pay.allowances, pay.deductions);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <Calculator className="text-emerald-600" />
            Payroll Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">Manage employee salary structures and generate payslips.</p>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Monthly Payroll</p>
            <p className="text-xl font-bold text-gray-900">₹{totalPayrollCost.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
        {loading && <div className="p-8 text-center text-gray-500">Loading payroll data...</div>}
        {error && <div className="p-4 m-6 text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm tracking-wider text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold text-right">Basic Salary</th>
                  <th className="p-4 font-semibold text-right">Allowances</th>
                  <th className="p-4 font-semibold text-right">Deductions</th>
                  <th className="p-4 font-semibold text-right">Net Salary</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 italic text-center text-gray-500">No employees found.</td></tr>
                ) : (
                  employees.map((emp) => {
                    const pay = getEmployeePayroll(emp.id);
                    const netPay = calculateNetPay(pay.basic_salary || pay.base_salary, pay.allowances, pay.deductions);
                    
                    return (
                      <tr key={emp.id} className="transition-colors hover:bg-emerald-50/30">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">EMP-{emp.id}</div>
                        </td>
                        <td className="p-4 text-right text-gray-600 font-medium">₹{Number(pay.basic_salary || pay.base_salary || 0).toLocaleString('en-IN')}</td>
                        <td className="p-4 text-right text-green-600 font-medium">+ ₹{Number(pay.allowances || 0).toLocaleString('en-IN')}</td>
                        <td className="p-4 text-right text-red-500 font-medium">- ₹{Number(pay.deductions || 0).toLocaleString('en-IN')}</td>
                        <td className="p-4 text-right text-gray-900 font-bold text-lg">₹{netPay.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => openEditModal(emp)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
                            >
                              <Edit size={16} /> Edit
                            </button>
                            <button 
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Generate Payslip"
                            >
                              <FileText size={16} /> Print
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Update Salary Structure
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">Employee</p>
              <p className="font-bold text-gray-800 text-lg">{selectedEmp?.first_name} {selectedEmp?.last_name}</p>
            </div>

            <form onSubmit={handleSavePayroll} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Month / Year</label>
                  <input type="month" required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.month_year} onChange={(e) => setFormData({...formData, month_year: e.target.value})} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Basic Salary (₹)</label>
                  <input type="number" min="0" required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.basic_salary} onChange={(e) => setFormData({...formData, basic_salary: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-green-700">Allowances (₹)</label>
                  <input type="number" min="0" required
                    className="w-full p-2 border border-green-300 bg-green-50 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={formData.allowances} onChange={(e) => setFormData({...formData, allowances: e.target.value})} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-red-700">Deductions (₹)</label>
                  <input type="number" min="0" required
                    className="w-full p-2 border border-red-300 bg-red-50 rounded-md focus:ring-red-500 focus:border-red-500"
                    value={formData.deductions} onChange={(e) => setFormData({...formData, deductions: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 mt-4 bg-gray-900 text-white rounded-lg">
                <span className="font-medium">Net Payable:</span>
                <span className="text-xl font-bold text-emerald-400">
                  ₹{calculateNetPay(formData.basic_salary, formData.allowances, formData.deductions).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                  Process Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayrollManager;