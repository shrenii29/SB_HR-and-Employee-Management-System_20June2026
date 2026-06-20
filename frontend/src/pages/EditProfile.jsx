import { useState } from 'react';
import axios from 'axios';

const EditProfile = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [phone, setPhone] = useState(user?.phone_number || '');

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/employees/update-profile`,
        { phone_number: phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('Updated successfully');
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  return (
    <div className="max-w-md bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

      <label className="block mb-2 text-sm">Phone Number</label>
      <input
  type="text"
  value={phone}
  maxLength={10}
  onChange={(e) => {
    const value = e.target.value;

    // allow only digits
    if (/^\d*$/.test(value)) {
      setPhone(value);
    }
  }}
  className="w-full border p-2 rounded mb-4"
/>

      <button
        onClick={handleUpdate}
        className="px-4 py-2 bg-emerald-600 text-white rounded"
      >
        Save
      </button>
    </div>
  );
};

export default EditProfile;