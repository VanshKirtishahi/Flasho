import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MoreVertical, X, CheckCircle, 
  AlertCircle, Clock, FileText, Truck, Wrench, Wallet, Phone, Mail, ShieldAlert, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  
  // Drawer & Action State
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false); // 🟢 New Loading State for Blocking

  const fetchWorkers = async () => {
    try {
      setIsLoading(true);
      // Fetch workers and jobs to calculate stats
      const [workersRes, jobsRes] = await Promise.all([
        api.get('/franchiseDashboard/workers'),
        api.get('/franchiseDashboard/jobs')
      ]);

      const jobsData = jobsRes.data;

      // Enhance workers with job stats
      const enhancedWorkers = workersRes.data.map(worker => {
        const wId = String(worker._id);
        const workerJobs = jobsData.filter(j => String(j?.worker_id?._id || j?.worker_id) === wId);
        const completedJobs = workerJobs.filter(j => String(j?.status).toLowerCase() === 'completed');
        const totalGenerated = Math.round(completedJobs.reduce((sum, j) => sum + (Number(j?.price) || Number(j?.amount) || 0), 0));

        return {
          ...worker,
          totalJobs: workerJobs.length,
          completedJobs: completedJobs.length,
          totalGenerated
        };
      });

      setWorkers(enhancedWorkers);
    } catch (error) {
      console.error("Error fetching workers:", error);
      toast.error("Failed to load workers data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const openWorkerDetails = (worker) => {
    setSelectedWorker(worker);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedWorker(null), 300); // clear after animation
  };

  // 🟢 NEW: BLOCK / UNBLOCK LOGIC
  const handleToggleBlock = async () => {
    if (!selectedWorker) return;
    
    const newBlockStatus = !selectedWorker.is_blocked;
    setIsBlocking(true);
    
    try {
      // API call to update the block status
      await api.put(`/franchiseDashboard/workers/${selectedWorker._id}/block`, {
        is_blocked: newBlockStatus
      });
      
      toast.success(`Worker has been successfully ${newBlockStatus ? 'blocked' : 'unblocked'}.`);
      
      // Instantly update the main table list
      setWorkers(prevWorkers => prevWorkers.map(w => {
        if (w._id === selectedWorker._id) {
          return { ...w, is_blocked: newBlockStatus };
        }
        return w;
      }));
      
      // Instantly update the open drawer
      setSelectedWorker(prev => ({ ...prev, is_blocked: newBlockStatus }));
      
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update block status.");
      console.error("Block Error:", error);
    } finally {
      setIsBlocking(false);
    }
  };


  // 🟢 APPROVE WORKER LOGIC
  const handleApproveWorker = async () => {
    if (!selectedWorker) return;
    setIsApproving(true);
    
    try {
      await api.put(`/franchiseDashboard/workers/${selectedWorker._id}/approve`);
      toast.success(`${selectedWorker.full_name} has been officially approved!`);
      
      // Instantly update the main table list
      setWorkers(prevWorkers => prevWorkers.map(w => {
        if (w._id === selectedWorker._id) {
          return { ...w, verification_status: 'approved', is_verified: true, verified: true };
        }
        return w;
      }));
      
      // Instantly update the open drawer UI
      setSelectedWorker(prev => ({ ...prev, verification_status: 'approved', is_verified: true, verified: true }));
      
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to approve worker.");
    } finally {
      setIsApproving(false);
    }
  };

  // Filter workers based on search
  const filteredWorkers = workers.filter(w => 
    (w.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.phone || '').includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Workforce</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage, verify, and monitor your franchise professionals.</p>
        </div>
        
        {/* SEARCH & FILTERS */}
        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-medium transition-all w-64"
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 text-[#05AC5F] animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
                  <th className="px-6 py-4">Professional</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4 text-right">Completed Jobs</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">No workers found.</td>
                  </tr>
                ) : (
                  filteredWorkers.map(worker => (
                    <tr key={worker._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#05AC5F] font-bold text-lg mr-3 overflow-hidden border border-[#05AC5F]/20 relative">
                            {worker.profile_image ? (
                              <img src={worker.profile_image} alt={worker.full_name} className="w-full h-full object-cover" />
                            ) : (
                              worker.full_name?.charAt(0).toUpperCase() || 'W'
                            )}
                            {/* Visual indicator if blocked on the avatar */}
                            {worker.is_blocked && (
                               <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px]"></div>
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${worker.is_blocked ? 'text-red-700 line-through decoration-red-300' : 'text-gray-900'}`}>{worker.full_name}</p>
                            <p className="text-xs font-medium text-gray-500">ID: {worker._id.substring(worker._id.length - 6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Contact */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-700">{worker.phone}</p>
                      </td>

                      {/* Online/Offline/Blocked Status */}
                      <td className="px-6 py-4">
                        {worker.is_blocked ? (
                          <StatusBadge color="red" icon={<ShieldAlert size={12}/>} text="Blocked" />
                        ) : worker.is_online ? (
                          <StatusBadge color="green" icon={<div className="w-1.5 h-1.5 rounded-full bg-[#05AC5F]"></div>} text="Online" />
                        ) : (
                          <StatusBadge color="gray" icon={<div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>} text="Offline" />
                        )}
                      </td>

                      {/* Verification Status */}
                      <td className="px-6 py-4">
                        <VerificationBadge status={worker.verification_status} isVerified={worker.is_verified || worker.verified} />
                      </td>

                      {/* Stats */}
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-gray-900">{worker.completedJobs}</p>
                        <p className="text-xs font-medium text-gray-500">₹{worker.totalGenerated.toLocaleString()} earned</p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => openWorkerDetails(worker)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          View Details
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

      {/* 🟢 SLIDE-OVER DRAWER FOR WORKER DETAILS */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />
          
          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-[#F9FAFB] shadow-2xl flex flex-col animate-slide-in-right border-l border-gray-200">
            
            {/* Drawer Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                Worker Profile
              </h2>
              <button onClick={closeDrawer} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
              {selectedWorker && (
                <>
                  {/* Personal Header Card */}
                  <div className={`p-6 rounded-2xl border shadow-sm flex items-center gap-5 transition-colors ${selectedWorker.is_blocked ? 'bg-red-50 border-red-100' : 'bg-white border-gray-200'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl overflow-hidden border-2 shadow-inner ${selectedWorker.is_blocked ? 'bg-red-100 text-red-500 border-red-200' : 'bg-[#E8F8F0] text-[#05AC5F] border-[#05AC5F]/20'}`}>
                      {selectedWorker.profile_image ? (
                        <img src={selectedWorker.profile_image} alt={selectedWorker.full_name} className={`w-full h-full object-cover ${selectedWorker.is_blocked ? 'grayscale opacity-75' : ''}`} />
                      ) : (
                        selectedWorker.full_name?.charAt(0).toUpperCase() || 'W'
                      )}
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${selectedWorker.is_blocked ? 'text-red-900 line-through decoration-red-300' : 'text-gray-900'}`}>
                        {selectedWorker.full_name}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                         <VerificationBadge status={selectedWorker.verification_status} isVerified={selectedWorker.is_verified || selectedWorker.verified} />
                         {selectedWorker.is_blocked && (
                           <StatusBadge color="red" icon={<ShieldAlert size={12}/>} text="Account Suspended" />
                         )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center"><Users size={16} className="mr-2 text-[#05AC5F]"/> Contact Details</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      <DetailRow icon={<Phone size={16} />} label="Phone Number" value={selectedWorker.phone} />
                      <DetailRow icon={<Mail size={16} />} label="Email Address" value={selectedWorker.email || 'Not provided'} />
                    </div>
                  </div>

                  {/* Skills & Services */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center"><Wrench size={16} className="mr-2 text-blue-500"/> Skills & Services</h4>
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {selectedWorker.skills && selectedWorker.skills.length > 0 ? (
                          selectedWorker.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 italic">No standard skills listed</span>
                        )}
                      </div>
                      {selectedWorker.custom_service && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs font-bold text-gray-500 mb-1">Custom Service:</p>
                          <p className="text-sm font-medium text-gray-900">{selectedWorker.custom_service}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center"><Truck size={16} className="mr-2 text-purple-500"/> Vehicle Information</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      <DetailRow label="Has Vehicle" value={selectedWorker.has_vehicle ? "Yes" : "No"} />
                      {selectedWorker.has_vehicle && (
                        <>
                          <DetailRow label="Vehicle Type" value={selectedWorker.vehicle_type || 'N/A'} />
                          <DetailRow label="Vehicle Number" value={selectedWorker.vehicle_number || 'N/A'} isHighlight />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center"><FileText size={16} className="mr-2 text-orange-500"/> Documents Provided</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      <DetailRow label="ID Type" value={selectedWorker.govt_id_type?.toUpperCase() || 'Not Provided'} />
                      
                      {selectedWorker.documents && Object.keys(selectedWorker.documents).length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          {Object.entries(selectedWorker.documents).map(([key, url]) => (
                            <a 
                              key={key} 
                              href={url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all group"
                            >
                              <FileText size={24} className="text-gray-400 group-hover:text-[#05AC5F] mb-2" />
                              <span className="text-xs font-bold text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No documents uploaded.</p>
                      )}
                    </div>
                  </div>

                  {/* Financial Quick View */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center"><Wallet size={16} className="mr-2 text-green-600"/> Lifetime Stats</h4>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Jobs</p>
                        <p className="text-xl font-black text-gray-900">{selectedWorker.completedJobs}</p>
                      </div>
                      <div className="p-4 bg-[#E8F8F0] rounded-xl border border-[#05AC5F]/20">
                        <p className="text-xs font-bold text-[#048C4F] uppercase tracking-wider mb-1">Generated</p>
                        <p className="text-xl font-black text-[#05AC5F]">₹{selectedWorker.totalGenerated?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Spacer for bottom actions */}
                  <div className="h-10"></div>
                </>
              )}
            </div>

            {/* 🟢 STICKY BOTTOM ACTIONS WITH APPROVE & BLOCK LOGIC */}
            <div className="bg-white p-5 border-t border-gray-200 flex gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10">
               
               {/* APPROVE BUTTON (Hides if already approved) */}
               {(!selectedWorker?.is_verified && selectedWorker?.verification_status !== 'approved') && (
                 <button 
                   onClick={handleApproveWorker}
                   disabled={isApproving}
                   className="flex-1 py-3 bg-[#05AC5F] hover:bg-[#048C4F] text-white rounded-xl font-bold text-sm shadow-md transition-all flex justify-center items-center disabled:opacity-70"
                 >
                   {isApproving ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} className="mr-2" /> Approve Worker</>}
                 </button>
               )}
               
               {/* BLOCK / UNBLOCK BUTTON */}
               <button 
                 onClick={handleToggleBlock}
                 disabled={isBlocking}
                 className={`px-6 py-3 border rounded-xl font-bold text-sm transition-all flex justify-center items-center ${
                   selectedWorker?.is_blocked 
                     ? 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200' 
                     : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                 }`}
               >
                 {isBlocking ? (
                   <Loader2 size={16} className="animate-spin" />
                 ) : (
                   selectedWorker?.is_blocked ? 'Unblock' : 'Block'
                 )}
               </button>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        .animate-slide-in-right {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const DetailRow = ({ label, value, icon, isHighlight }) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center text-sm font-semibold text-gray-500">
      {icon && <span className="mr-2 text-gray-400">{icon}</span>}
      {label}
    </div>
    <div className={`text-sm font-bold ${isHighlight ? 'text-[#05AC5F] bg-[#E8F8F0] px-3 py-1 rounded-md border border-[#05AC5F]/20' : 'text-gray-900'}`}>
      {value}
    </div>
  </div>
);

const StatusBadge = ({ color, icon, text }) => {
  const colorMap = {
    green: 'bg-[#E8F8F0] text-[#048C4F] border-[#05AC5F]/20',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${colorMap[color]}`}>
      <span className="mr-1.5">{icon}</span> {text}
    </span>
  );
};

const VerificationBadge = ({ status, isVerified, className = '' }) => {
  if (isVerified || String(status).toLowerCase() === 'approved') {
    return <StatusBadge color="green" icon={<CheckCircle size={12}/>} text="Verified" className={className} />;
  }
  if (String(status).toLowerCase() === 'pending') {
    return <StatusBadge color="gray" icon={<Clock size={12}/>} text="Pending Review" className={className} />;
  }
  if (['rejected', 'failed'].includes(String(status).toLowerCase())) {
    return <StatusBadge color="red" icon={<AlertCircle size={12}/>} text="Rejected" className={className} />;
  }
  return <StatusBadge color="gray" icon={<AlertCircle size={12}/>} text="Unsubmitted" className={className} />;
};

export default Workers;