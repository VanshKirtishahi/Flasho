import React, { useState, useEffect } from 'react';
import { Briefcase, Users, Wallet, TrendingUp, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeWorkers: 0,
    pendingJobs: 0,
    completedJobs: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 🟢 Fetch everything in parallel for maximum speed
        const [jobsRes, workersRes] = await Promise.all([
          api.get('/franchiseDashboard/jobs'),
          api.get('/franchiseDashboard/workers'),
        ]);

        const jobs = jobsRes.data;
        const workers = workersRes.data;

        // Calculate KPIs
        const completed = jobs.filter(j => j.status === 'completed');
        const pending = jobs.filter(j => ['pending', 'assigned'].includes(j.status));
        const activeW = workers.filter(w => w.is_online && !w.is_blocked).length;
        const revenue = Math.round(completed.reduce((sum, job) => sum + (Number(job.price) || 0), 0));

        setStats({
          totalRevenue: revenue,
          activeWorkers: activeW,
          pendingJobs: pending.length,
          completedJobs: completed.length,
        });

        // Get 5 most recent jobs
        setRecentJobs(jobs.slice(0, 5));
      } catch (error) {
        console.error("Dashboard Error", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#05AC5F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Real-time metrics for your franchise territory.</p>
      </div>

      {/* 🟢 KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={<Wallet className="text-[#05AC5F]" />} 
          trend="+12% this month"
          color="bg-[#E8F8F0]"
        />
        <StatCard 
          title="Active Workers" 
          value={stats.activeWorkers} 
          icon={<Users className="text-blue-600" />} 
          trend="Online right now"
          color="bg-blue-50"
        />
        <StatCard 
          title="Pending Jobs" 
          value={stats.pendingJobs} 
          icon={<AlertCircle className="text-orange-600" />} 
          trend="Requires assignment"
          color="bg-orange-50"
        />
        <StatCard 
          title="Completed Jobs" 
          value={stats.completedJobs} 
          icon={<Briefcase className="text-purple-600" />} 
          trend="Lifetime total"
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🟢 RECENT ACTIVITY FEED */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Recent Service Requests</h2>
            <Link to="/jobs" className="text-sm font-bold text-[#05AC5F] hover:text-[#048C4F] flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentJobs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-medium">No recent jobs found.</div>
            ) : (
              recentJobs.map(job => (
                <div key={job._id} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{job.service_title}</h3>
                    <p className="text-xs font-medium text-gray-500 mt-1">{job.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#05AC5F]">₹{Math.round(Number(job.price) || 0).toLocaleString()}</p>
                    <span className={`inline-block mt-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      job.status === 'completed' ? 'bg-[#E8F8F0] text-[#048C4F]' :
                      job.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🟢 QUICK ACTIONS (Industry standard for admin panels) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/workers" className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-[#05AC5F]/30 hover:bg-[#E8F8F0]/50 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-[#05AC5F]/10 flex items-center justify-center mr-4">
                <Users size={20} className="text-gray-600 group-hover:text-[#05AC5F]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Manage Workers</p>
                <p className="text-xs text-gray-500 font-medium">Approve or assign staff</p>
              </div>
            </Link>
            
            <Link to="/financials" className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-[#05AC5F]/30 hover:bg-[#E8F8F0]/50 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-[#05AC5F]/10 flex items-center justify-center mr-4">
                <Wallet size={20} className="text-gray-600 group-hover:text-[#05AC5F]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Process Payouts</p>
                <p className="text-xs text-gray-500 font-medium">Clear unpaid worker balances</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable KPI Component
const StatCard = ({ title, value, icon, trend, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <span className="flex items-center text-xs font-bold text-gray-400"><TrendingUp size={14} className="mr-1"/> {trend}</span>
    </div>
    <div>
      <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
      <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wider">{title}</p>
    </div>
  </div>
);

export default Dashboard;