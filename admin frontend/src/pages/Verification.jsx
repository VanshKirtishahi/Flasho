import { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, User as UserIcon, Phone, Mail, Car, Wrench, CreditCard, Image as ImageIcon, Building2 } from 'lucide-react';

export default function Verification() {
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingWorkers();
  }, []);

  const fetchPendingWorkers = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await axios.get('http://localhost:5000/api/admin/workers/pending', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      setPendingWorkers(res.data);
    } catch (error) {
      toast.error("Failed to load pending verifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toUpperCase()} this worker?`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.put(`http://localhost:5000/api/admin/workers/${id}/verify`,
        { status }, 
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      toast.success(`Worker ${status} successfully!`);
      setPendingWorkers(prev => prev.filter(w => w._id !== id));
    } catch (error) {
      toast.error(`Failed to ${status} worker`);
    }
  };

  const DocumentImage = ({ label, url }) => {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
        {url && url.length > 5 ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="group relative block rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-[4/3]">
            <img src={url} alt={label} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold">View Full</span>
            </div>
          </a>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-50 rounded-lg aspect-[4/3] text-gray-400">
            <ImageIcon size={20} className="mb-1 opacity-50" />
            <span className="text-[10px] font-medium">Not Provided</span>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600" size={48}/></div>;
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Pending Partner Verifications</h1>
        <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-bold">
          {pendingWorkers.length} Pending
        </span>
      </div>

      {pendingWorkers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border shadow-sm mt-8">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={56} />
          <h2 className="text-xl font-bold text-gray-700">All caught up!</h2>
          <p className="text-gray-500 mt-2">There are no pending worker verifications right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {pendingWorkers.map(worker => (
            <div key={worker._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              
              {/* TOP HEADER: User Info */}
              <div className="p-6 border-b flex gap-6 items-center bg-gray-50 relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-200 flex-shrink-0">
                  {worker.documents?.selfie || worker.documents?.id_proof ? (
                    <img src={worker.documents.selfie || worker.documents.id_proof} alt="Selfie" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={48} className="m-auto h-full text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {worker.full_name || "Unknown User"}
                  </h3>
                  
                  {/* 🟢 NEW: Agency Badge */}
                  {worker.agency_id ? (
                    <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Building2 size={12} />
                      {worker.agency_id.name || 'Assigned to Agency'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                      <UserIcon size={12} />
                      Independent
                    </span>
                  )}

                  <div className="text-gray-500 text-sm mt-3 flex flex-col gap-1.5">
                    <span className="flex items-center gap-2"><Phone size={14}/> {worker.phone || "No Phone"}</span>
                    <span className="flex items-center gap-2"><Mail size={14}/> {worker.email || "No Email"}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-6">
                {/* MIDDLE: Work & Vehicle Info */}
                <div className="grid grid-cols-2 gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  {/* Skills */}
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Wrench size={16} className="text-blue-500"/> Skills & Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {worker.skills?.map((skill, i) => (
                        <span key={i} className="bg-white border border-blue-200 text-blue-700 text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
                          {skill}
                        </span>
                      ))}
                      {(!worker.skills || worker.skills.length === 0) && <span className="text-gray-400 text-xs italic">None</span>}
                    </div>
                    {worker.custom_service && (
                      <p className="text-xs text-gray-600 mt-2"><span className="font-semibold">Custom:</span> {worker.custom_service}</p>
                    )}
                  </div>

                  {/* Vehicle & ID Info */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><CreditCard size={16} className="text-purple-500"/> ID Type</h4>
                      <p className="text-sm text-gray-600">{worker.govt_id_type || "Aadhar"}</p>
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1"><Car size={16} className="text-green-500"/> Vehicle Details</h4>
                      {worker.has_vehicle ? (
                        <p className="text-sm text-gray-600 capitalize">
                          {worker.vehicle_type} <span className="font-bold border bg-white px-1.5 py-0.5 rounded ml-1 text-xs">{worker.vehicle_number || "No Plate"}</span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No Vehicle</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTTOM: Documents Grid */}
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">Submitted Documents</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <DocumentImage label="Govt ID Front" url={worker.documents?.govt_front} />
                    <DocumentImage label="Govt ID Back" url={worker.documents?.govt_back} />
                    <DocumentImage label="Live Selfie" url={worker.documents?.selfie} />
                    
                    {worker.has_vehicle && (
                      <>
                        <DocumentImage label="Driving License" url={worker.documents?.license} />
                        <DocumentImage label="Vehicle RC" url={worker.documents?.vehicle_rc} />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 p-4 bg-gray-50 border-t mt-auto">
                <button
                  onClick={() => handleVerification(worker._id, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 bg-white rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors font-bold text-sm"
                >
                  <XCircle size={18} /> Reject Partner
                </button>
                <button
                  onClick={() => handleVerification(worker._id, 'approved')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm transition-colors font-bold text-sm"
                >
                  <CheckCircle size={18} /> Approve Partner
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}