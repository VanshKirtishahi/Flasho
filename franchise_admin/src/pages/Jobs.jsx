import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { Briefcase, Loader2, Calendar, User, UserCheck, MapPin, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for Image Proofs
  const [selectedProof, setSelectedProof] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. Check user role to determine which endpoint to hit
      const meRes = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      const endpoint = meRes.data.role === 'admin' 
        ? 'http://localhost:5000/api/admin/bookings'
        : 'http://localhost:5000/api/agency/bookings';

      // 2. Fetch the appropriate jobs
      const jobsRes = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      setJobs(jobsRes.data);
    } catch (error) {
      toast.error("Failed to load jobs directory");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-orange-50 text-orange-600 border-orange-200",
      assigned: "bg-blue-50 text-blue-600 border-blue-200",
      confirmed: "bg-purple-50 text-purple-600 border-purple-200",
      in_progress: "bg-indigo-50 text-indigo-600 border-indigo-200",
      completed: "bg-green-50 text-[#05AC5F] border-[#05AC5F]/30",
      cancelled: "bg-red-50 text-red-600 border-red-200",
      dropped: "bg-gray-100 text-gray-600 border-gray-300"
    };

    const style = styles[status] || "bg-gray-50 text-gray-600 border-gray-200";
    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${style}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-[#05AC5F]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 🟢 Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Briefcase className="mr-3 text-[#05AC5F]" size={28} />
            Jobs & Tasks
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Monitor active jobs and review completed work proofs.</p>
        </div>
        <div className="bg-[#E8F8F0] text-[#048C4F] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 border border-[#05AC5F]/20">
          <Briefcase size={16} /> {jobs.length} Total Jobs
        </div>
      </div>

      {/* 🟢 Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
          <Briefcase className="mx-auto text-gray-300 mb-3" size={40}/>
          <p className="text-gray-500 font-bold">No jobs have been processed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate pr-4">
                    {job.service_title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                    <Calendar size={12} /> Scheduled: {new Date(job.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(job.status)}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <p className="text-sm font-semibold text-gray-700">{job.location || 'Location not specified'}</p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Value</span>
                  <span className="text-lg font-black text-[#05AC5F]">₹{job.price.toFixed(0)}</span>
                </div>
              </div>

              {/* 🟢 PROOF OF WORK BUTTON */}
              {job.status === 'completed' && job.before_image && job.after_image && (
                <button 
                  onClick={() => setSelectedProof(job)}
                  className="w-full mb-4 py-2.5 bg-[#E8F8F0] hover:bg-[#05AC5F] text-[#05AC5F] hover:text-white transition-colors duration-200 rounded-xl font-bold text-sm flex justify-center items-center gap-2 border border-[#05AC5F]/20"
                >
                  <ImageIcon size={18} />
                  View Proof of Work Images
                </button>
              )}

              <div className="flex gap-4 pt-4 border-t border-gray-50">
                {/* Client Info */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                    {job.user_id?.full_name?.charAt(0)?.toUpperCase() || <User size={14}/>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{job.user_id?.full_name || 'Unregistered'}</p>
                  </div>
                </div>

                {/* Worker Info */}
                <div className="flex-1 flex items-center gap-3 border-l border-gray-100 pl-4">
                  <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                    {job.worker_id?.full_name?.charAt(0)?.toUpperCase() || <UserCheck size={14}/>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Professional</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{job.worker_id?.full_name || 'Not Assigned'}</p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 🟢 PROOF OF WORK IMAGE MODAL */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">{selectedProof.service_title}</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">Proof of Work Assessment</p>
              </div>
              <button 
                onClick={() => setSelectedProof(null)}
                className="p-2 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Side-by-Side Images */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* BEFORE IMAGE */}
                <div className="flex flex-col">
                  <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className="font-black text-gray-400 tracking-widest uppercase text-xs">Condition Before</span>
                      <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    </div>
                    <div className="relative flex-1 bg-gray-100 rounded-xl overflow-hidden min-h-[300px]">
                      <img 
                        src={selectedProof.before_image} 
                        alt="Before Service" 
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* AFTER IMAGE */}
                <div className="flex flex-col">
                  <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className="font-black text-[#05AC5F] tracking-widest uppercase text-xs">Condition After</span>
                      <span className="w-2 h-2 rounded-full bg-[#05AC5F]"></span>
                    </div>
                    <div className="relative flex-1 bg-gray-100 rounded-xl overflow-hidden min-h-[300px]">
                      <img 
                        src={selectedProof.after_image} 
                        alt="After Service" 
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    {selectedProof.worker_id?.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed By</p>
                    <p className="text-sm font-bold text-gray-800">{selectedProof.worker_id?.full_name}</p>
                  </div>
                </div>
               <button 
                onClick={() => setSelectedProof(null)}
                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors"
               >
                 Close Gallery
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}