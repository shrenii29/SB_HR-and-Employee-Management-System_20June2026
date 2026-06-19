import { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeSalary = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchMyPayroll = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payroll/my-payroll`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    };
    fetchMyPayroll();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">My Salary History</h2>
      <table className="w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-3 text-left">Month</th>
            <th className="p-3 text-right">Basic</th>
            <th className="p-3 text-right">Net Pay</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-b">
              <td className="p-3">{h.month_year}</td>
              <td className="p-3 text-right">₹{h.basic_salary}</td>
              <td className="p-3 text-right font-bold">₹{h.basic_salary + h.allowances - h.deductions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default EmployeeSalary;