import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'];

const StatCard = ({ icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  </div>
);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin')
      .then((r) => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  const { summary, deptHeadcount, monthlySummary, recentLeave, payrollSummary } = data || {};

  const monthlyChartData = (monthlySummary || []).map((m) => ({
    name: `${MONTHS[m.month - 1]} ${m.year}`,
    Present: m.present,
    Absent:  m.absent,
    Late:    m.late,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">HR overview and analytics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Employees"   value={summary?.totalEmployees}    color="bg-blue-100" />
        <StatCard icon="🏢" label="Departments"       value={summary?.totalDepartments}  color="bg-purple-100" />
        <StatCard icon="📋" label="Pending Leaves"    value={summary?.pendingLeaveCount} color="bg-yellow-100" />
        <StatCard icon="✅" label="Present Today"     value={summary?.todayPresent}      color="bg-green-100" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly attendance bar chart */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Attendance (last 6 months)</h2>
          {monthlyChartData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Present" fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="Absent"  fill="#ef4444" radius={[4,4,0,0]} />
                <Bar dataKey="Late"    fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-10">No attendance data yet</p>}
        </div>

        {/* Dept headcount pie */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Employees by Department</h2>
          {deptHeadcount?.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptHeadcount} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, count }) => `${name}: ${count}`} labelLine={false}>
                  {deptHeadcount.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-10">No department data yet</p>}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leave requests */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Leave Requests</h2>
          {recentLeave?.length ? (
            <div className="space-y-3">
              {recentLeave.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{l.first_name} {l.last_name}</p>
                    <p className="text-xs text-gray-500">{l.leave_type} · {l.start_date} → {l.end_date}</p>
                  </div>
                  <span className={`badge-${l.status}`}>{l.status}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No recent requests</p>}
        </div>

        {/* Payroll summary */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Payroll — Current Month</h2>
          {payrollSummary ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Records', value: payrollSummary.total_records },
                { label: 'Total Payout',  value: `₹${Number(payrollSummary.total_payout || 0).toLocaleString('en-IN')}` },
                { label: 'Paid',          value: payrollSummary.paid },
                { label: 'Pending',       value: payrollSummary.pending },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value ?? 0}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No payroll data yet</p>}
        </div>
      </div>
    </div>
  );
}