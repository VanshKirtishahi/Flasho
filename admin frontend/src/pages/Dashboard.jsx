import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
// 🟢 FIXED: Added HardHat to the import list below
import { Users, Briefcase, IndianRupee, ClipboardList, Loader2, TrendingUp, Calendar, HardHat } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0, totalWorkers: 0, totalServices: 0, totalBookings: 0, totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      toast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#00C896]" size={40} />
          <p className="text-gray-500 font-medium">Syncing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div>
          <p className="text-gray-500 font-semibold mb-1 flex items-center gap-2">
            <Calendar size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {getGreeting()}, Admin! 👋
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Here is what is happening with Flasho today.</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue Card (Highlighted) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-xl shadow-gray-900/20 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-2">Total Revenue</p>
              <h2 className="text-5xl font-black text-white tracking-tight">₹{stats.totalRevenue?.toLocaleString('en-IN')}</h2>
            </div>
            <div className="w-14 h-14 bg-[#00C896]/20 rounded-2xl flex items-center justify-center border border-[#00C896]/30">
              <IndianRupee size={28} className="text-[#00C896]" />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[#00C896] text-sm font-semibold bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-sm">
            <TrendingUp size={16} /> +12.5% from last month
          </div>
        </div>

        {/* Regular Metric Cards */}
        <MetricCard title="Total Bookings" value={stats.totalBookings} icon={<ClipboardList size={24} />} color="blue" />
        <MetricCard title="Active Services" value={stats.totalServices} icon={<Briefcase size={24} />} color="pink" />
        <MetricCard title="Verified Partners" value={stats.totalWorkers} icon={<HardHat size={24} />} color="orange" />
        <MetricCard title="Registered Clients" value={stats.totalClients} icon={<Users size={24} />} color="purple" />

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    pink: 'bg-pink-50 text-pink-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-gray-500 font-bold text-sm mb-1">{title}</p>
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h2>
    </div>
  );
}