import { useEffect, useState } from 'react';
import api from '../lib/api'; // 🟢 IMPORT THE CENTRALIZED API CLIENT
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, ExternalLink, Truck, Search, Users, Clock, ShieldCheck, ShieldX, ChevronDown, Building2 } from 'lucide-react';

const STATUS_CONFIG = {
  approved: { label: 'Approved', bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  pending: { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  unsubmitted: { label: 'Unsubmitted', bg: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
};

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [expanded, setExpanded] = useState(null); 

  useEffect(() => { fetchWorkers(); }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      // 🟢 NO MORE MANUAL SESSIONS OR HEADERS - The API client handles it!
      const res = await api.get('/admin/workers');
      
      setWorkers(res.data);
    } catch {
      toast.error('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (id, status) => {
    try {
      // 🟢 NO MORE MANUAL SESSIONS OR HEADERS
      await api.put(`/admin/workers/${id}/verify`, { status });
      
      toast.success(`Partner ${status === 'approved' ? 'approved ✓' : 'rejected'}`);
      fetchWorkers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = workers.filter(w => {
    const matchSearch = !search || w.full_name?.toLowerCase().includes(search.toLowerCase()) || w.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || w.verification_status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: workers.length,
    pending: workers.filter(w => w.verification_status === 'pending').length,
    approved: workers.filter(w => w.verification_status === 'approved').length,
    rejected: workers.filter(w => w.verification_status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl space-y-6">
      
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Partner Directory</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Review and verify field partner applications.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Pills */}
          {[
            { key: 'all', label: 'All', icon: <Users size={14}/>, base: 'bg-gray-100 text-gray-600', active: 'bg-gray-900 text-white' },
            { key: 'pending', label: 'Pending', icon: <Clock size={14}/>, base: 'bg-amber-50 text-amber-700', active: 'bg-amber-600 text-white' },
            { key: 'approved', label: 'Approved', icon: <ShieldCheck size={14}/>, base: 'bg-green-50 text-green-700', active: 'bg-[#00C896] text-white' },
            { key: 'rejected', label: 'Rejected', icon: <ShieldX size={14}/>, base: 'bg-red-50 text-red-700', active: 'bg-red-600 text-white' },
          ].map(({ key, label, icon, base, active }) => (
            <button 
              key={key} 
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${filter === key ? active + ' shadow-md' : base + ' hover:opacity-80'}`}
            >
              {icon} {label}
              <span className={`px-1.5 py-0.5 rounded text-xs ${filter === key ? 'bg-white/20' : 'bg-black/5'}`}>{counts[key]}</span>
            </button>
          ))}

          {/* Search */}
          <div className="relative w-full sm:w-64 ml-auto xl:ml-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search partners..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_0.5fr] gap-4 px-6 py-4 bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          <div>Partner</div>
          <div>Skills</div>
          <div>Vehicle</div>
          <div>Status</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Loading partners...</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="mx-auto text-gray-300 mb-3" size={40}/>
              <p className="text-gray-500 font-bold">{search ? 'No partners match your search' : 'No partners found'}</p>
            </div>
          ) : (
            filtered.map((w) => {
              const cfg = STATUS_CONFIG[w.verification_status] || STATUS_CONFIG.unsubmitted;
              const isExpanded = expanded === w._id;
              const skills = Array.isArray(w.skills) ? w.skills : [];
              
              return (
                <div key={w._id} className="transition-colors duration-150 group hover:bg-gray-50/30">
                  <div className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_0.5fr] gap-4 px-6 py-4 items-center ${isExpanded ? 'bg-gray-50/50' : ''}`}>
                    
                    {/* Partner Details */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C896] to-[#009E78] flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                        {w.full_name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-extrabold text-gray-900 text-sm flex items-center gap-2 truncate">
                          <span className="truncate">{w.full_name}</span>
                          
                          {/* AGENCY NAME BADGE */}
                          {w.agency_id && (
                            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap">
                              <Building2 size={10} className="mr-1" />
                              {w.agency_id.name}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-medium truncate">{w.email}</div>
                        <div className="text-[11px] text-gray-400">{w.phone}</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 2).map(s => (
                        <span key={s} className="px-2 py-1 bg-green-50 text-green-700 border border-green-100 rounded-md text-[10px] font-bold uppercase tracking-wide">
                          {s}
                        </span>
                      ))}
                      {skills.length > 2 && <span className="text-xs font-bold text-gray-400 self-center">+{skills.length - 2}</span>}
                      {skills.length === 0 && <span className="text-xs text-gray-400 italic">None</span>}
                    </div>

                    {/* Vehicle */}
                    <div>
                      {w.has_vehicle ? (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Truck size={14}/></div>
                          <div>
                            <div className="text-xs font-bold text-gray-900 uppercase">{w.vehicle_type}</div>
                            <div className="text-[10px] font-bold text-gray-500">{w.vehicle_number}</div>
                          </div>
                        </div>
                      ) : <span className="text-xs text-gray-400 italic">No Vehicle</span>}
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-2">
                      {w.verification_status === 'pending' && (
                        <>
                          <button onClick={() => handleVerification(w._id, 'approved')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"><CheckCircle size={16}/></button>
                          <button onClick={() => handleVerification(w._id, 'rejected')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><XCircle size={16}/></button>
                        </>
                      )}
                      <button onClick={() => setExpanded(isExpanded ? null : w._id)} className="p-1.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-lg transition-all duration-200">
                        <ChevronDown size={16} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Accordion details */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50/50 border-t border-gray-100 shadow-inner">
                      
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                        <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">All Skills & Services</h4>
                        <div className="flex flex-wrap gap-2 mb-auto">
                          {skills.map(s => <span key={s} className="px-2 py-1 bg-green-50 text-green-700 border border-green-100 rounded-md text-[10px] font-bold uppercase">{s}</span>)}
                        </div>
                        {w.custom_service && <p className="text-xs text-gray-500 mt-3"><span className="font-bold text-gray-700">Custom:</span> {w.custom_service}</p>}
                        
                        {/* AGENCY NAME IN ACCORDION */}
                        <div className="mt-4 pt-4 border-t border-gray-50">
                           <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Employment Type</h4>
                           {w.agency_id ? (
                              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                                <Building2 size={14}/>
                                {w.agency_id.name}
                              </div>
                           ) : (
                             <div className="flex items-center gap-2 text-gray-600 text-xs font-bold bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                                <Users size={14}/>
                                Independent Professional
                              </div>
                           )}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">Documents</h4>
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-700 mb-2">ID Type: <span className="text-gray-500 font-medium">{w.govt_id_type || 'N/A'}</span></p>
                          {['govt_front', 'govt_back', 'selfie'].map(key => (
                            w.documents?.[key] ? (
                              <a key={key} href={w.documents[key]} target="_blank" rel="noreferrer" className="flex items-center gap-2 w-max px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors">
                                <ExternalLink size={12}/> {key.replace('govt_', 'ID ').replace('selfie', 'Selfie')}
                              </a>
                            ) : (
                              <span key={key} className="block text-xs text-gray-400 font-medium">Missing: {key}</span>
                            )
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">Profile Info</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-gray-500 font-medium">Joined</span> <span className="font-bold text-gray-900">{w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500 font-medium">Gender</span> <span className="font-bold text-gray-900">{w.gender || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500 font-medium">City</span> <span className="font-bold text-gray-900">{w.city || '—'}</span></div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}