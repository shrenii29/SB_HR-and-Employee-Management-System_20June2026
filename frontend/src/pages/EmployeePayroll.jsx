import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Wallet, FileText, Download, CheckCircle2 } from 'lucide-react';

const EmployeePayroll = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayslips = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payroll/my-payroll`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayslips(res.data);
    } catch (err) {
      setError('Failed to load payroll records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  // Helper function to format strings like '2023-10' into 'October 2023'
  const formatMonthYear = (yyyymm) => {
    if (!yyyymm) return '';
    const [year, month] = yyyymm.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-emerald-500" />
            My Payroll
          </h1>
          <p className="text-sm text-gray-500 mt-1">View your monthly salary slips and payment history.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <FileText className="text-gray-500" size={20} />
          <h2 className="font-bold text-gray-700">Salary History</h2>
        </div>

        {loading && <div className="p-8 text-center text-gray-500">Loading your payslips...</div>}
        {error && <div className="p-4 m-6 text-red-700 bg-red-50 rounded-lg">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                  <th className="p-4 font-semibold">Month</th>
                  <th className="p-4 font-semibold">Basic Salary</th>
                  <th className="p-4 font-semibold">Allowances</th>
                  <th className="p-4 font-semibold">Deductions</th>
                  <th className="p-4 font-semibold text-emerald-700">Net Pay</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payslips.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500 italic">
                      No payroll records found.
                    </td>
                  </tr>
                ) : (
                  payslips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">
                        {formatMonthYear(slip.month_year)}
                      </td>
                      <td className="p-4 text-gray-600">
                        {formatCurrency(slip.basic_salary)}
                      </td>
                      <td className="p-4 text-gray-600">
                        + {formatCurrency(slip.allowances)}
                      </td>
                      <td className="p-4 text-red-500">
                        - {formatCurrency(slip.deductions)}
                      </td>
                      <td className="p-4 font-bold text-emerald-600 text-lg">
                        {formatCurrency(slip.net_salary)}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full w-fit">
                          <CheckCircle2 size={14} /> {slip.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 text-sm font-medium"
                          onClick={() => alert(`Downloading payslip for ${formatMonthYear(slip.month_year)}...`)}
                        >
                          <Download size={16} /> PDF
                        </button>
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

export default EmployeePayroll;