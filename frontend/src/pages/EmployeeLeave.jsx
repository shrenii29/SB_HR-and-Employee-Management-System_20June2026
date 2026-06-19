import { useState } from 'react';
import axios from 'axios';

const EmployeeLeave = () => {
  const [formData, setFormData] = useState({ leave_type: 'Sick', start_date: '', end_date: '', reason: '' });

  const submitLeave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/leave/apply`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Leave requested successfully!");
    } catch (err) {
      alert("Failed to submit leave.");
    }
  };

  return (
    <form onSubmit={submitLeave} className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
      
      <select className="w-full p-2 mb-4 border rounded" onChange={(e) => setFormData({...formData, leave_type: e.target.value})}>
        <option value="Sick">Sick Leave</option>
        <option value="Casual">Casual Leave</option>
        <option value="Earned">Earned Leave</option>
      </select>

      <input type="date" className="w-full p-2 mb-4 border rounded" onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
      <input type="date" className="w-full p-2 mb-4 border rounded" onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
      <textarea className="w-full p-2 mb-4 border rounded" placeholder="Reason" onChange={(e) => setFormData({...formData, reason: e.target.value})} />
      
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Request</button>
    </form>
  );
};
export default EmployeeLeave;