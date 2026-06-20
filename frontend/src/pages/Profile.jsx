import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user'));
    } catch {
      storedUser = null;
    }

    setUser(storedUser);
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-xl bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-6">My Profile</h2>

      <div className="space-y-5">
        
        <div>
          <p className="text-sm text-gray-500">Full Name</p>
          <p className="font-semibold">
            {user.first_name} {user.last_name}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-semibold">{user.role}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Department</p>
          <p className="font-semibold">
            {user.department_name || "Not Assigned"}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-semibold">
              {user.phone_number || "Not set"}
            </p>
          </div>

          <button
            onClick={() => navigate('/employee-dashboard/edit-profile')}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            Edit
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;