import { Clock, CalendarDays, IndianRupee } from 'lucide-react';

const EmployeeDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Clock size={24}/></div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-xl font-bold text-gray-800">Checked In</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><CalendarDays size={24}/></div>
          <div>
            <p className="text-sm text-gray-500">Leaves Available</p>
            <p className="text-xl font-bold text-gray-800">12 Days</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><IndianRupee size={24}/></div>
          <div>
            <p className="text-sm text-gray-500">Next Payday</p>
            <p className="text-xl font-bold text-gray-800">1st of Month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;