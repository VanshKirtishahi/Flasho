import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { Building2, Plus, Users, CheckCircle, IndianRupee, X, Pencil, Trash2, MapPin, Phone, User as UserIcon, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const Agencies = () => {
  const [agencies, setAgencies] = useState([]);
  const [workers, setWorkers] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCredsModal, setShowCredsModal] = useState(false); // 🟢 NEW
  const [selectedAgency, setSelectedAgency] = useState(null); 
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', contact_person: '', phone: '', address: '' });
  
  // 🟢 NEW: Credentials State
  const [credsData, setCredsData] = useState({ email: '', password: '' });
  const [isCreatingCreds, setIsCreatingCreds] = useState(false);

  const API_URL = "http://localhost:5000/api";

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      const [agenciesRes, workersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/agencies/stats`, { headers }),
        axios.get(`${API_URL}/admin/workers`, { headers })
      ]);

      setAgencies(agenciesRes.data);
      setWorkers(workersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch agencies data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenForm = (agency = null) => {
    if (agency) {
      setEditingId(agency._id);
      setFormData({ name: agency.name || '', contact_person: agency.contact_person || '', phone: agency.phone || '', address: agency.address || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', contact_person: '', phone: '', address: '' });
    }
    setShowFormModal(true);
    setSelectedAgency(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      if (editingId) {
        await axios.put(`${API_URL}/admin/agencies/${editingId}`, formData, { headers });
        toast.success("Agency updated successfully!");
      } else {
        await axios.post(`${API_URL}/admin/agencies`, formData, { headers });
        toast.success("Agency created successfully!");
      }
      fetchData();
      setShowFormModal(false);
      setEditingId(null);
    } catch (error) {
      toast.error(editingId ? "Failed to update agency" : "Failed to create agency");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.delete(`${API_URL}/admin/agencies/${id}`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
      toast.success("Agency deleted successfully");
      setSelectedAgency(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete agency");
    }
  };

  // 🟢 NEW: HANDLE CREDENTIALS SUBMISSION
  const handleCreateCredentials = async (e) => {
    e.preventDefault();
    setIsCreatingCreds(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      await axios.post(`${API_URL}/admin/agencies/${selectedAgency._id}/credentials`, credsData, { headers });
      
      toast.success("Franchise Login Credentials created!");
      setShowCredsModal(false);
      setCredsData({ email: '', password: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create credentials");
    } finally {
      setIsCreatingCreds(false);
    }
  };

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Agencies</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage partner agencies and their performance.</p>
        </div>
        <button onClick={() => handleOpenForm()} className="bg-[#05AC5F] text-white px-5 py-2.5 rounded-lg flex items-center hover:bg-[#048C4F] transition-colors shadow-md shadow-[#05AC5F]/20 font-bold text-sm">
          <Plus className="h-5 w-5 mr-2" /> Add Agency
        </button>
      </div>

      {/* Grid of Agencies */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05AC5F]"></div>
        </div>
      ) : agencies.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Agencies Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <div key={agency._id} onClick={() => setSelectedAgency(agency)} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#05AC5F]/30 transition-all cursor-pointer group relative">
              <div className="p-6 border-b border-gray-50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-[#E8F8F0] p-3 rounded-xl border border-[#05AC5F]/20">
                    <Building2 className="h-6 w-6 text-[#05AC5F]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-[#05AC5F] transition-colors">{agency.name}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{agency.contact_person}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2 flex items-center gap-2 font-medium"><Phone size={14} className="text-gray-400" /> {agency.phone || 'N/A'}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2 truncate font-medium"><MapPin size={14} className="text-gray-400 flex-shrink-0" /> <span className="truncate">{agency.address || 'N/A'}</span></div>
              </div>
              <div className="bg-gray-50 p-4 grid grid-cols-3 divide-x divide-gray-200">
                <div className="text-center px-2">
                  <div className="flex items-center justify-center text-gray-500 mb-1"><Users className="h-4 w-4 mr-1" /><span className="text-[10px] font-bold uppercase tracking-wider">Workers</span></div>
                  <span className="text-lg font-black text-gray-900">{agency.total_workers || 0}</span>
                </div>
                <div className="text-center px-2">
                  <div className="flex items-center justify-center text-[#05AC5F] mb-1"><CheckCircle className="h-4 w-4 mr-1" /><span className="text-[10px] font-bold uppercase tracking-wider">Jobs</span></div>
                  <span className="text-lg font-black text-green-700">{agency.total_jobs_completed || 0}</span>
                </div>
                <div className="text-center px-2">
                  <div className="flex items-center justify-center text-blue-600 mb-1"><IndianRupee className="h-4 w-4 mr-1" /><span className="text-[10px] font-bold uppercase tracking-wider">Earned</span></div>
                  <span className="text-lg font-black text-blue-700">₹{(agency.total_earnings || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Agency Modal */}
      {selectedAgency && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/80">
              <div className="flex gap-4 items-center">
                <div className="bg-[#E8F8F0] p-4 rounded-xl border border-[#05AC5F]/20"><Building2 className="h-8 w-8 text-[#05AC5F]" /></div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedAgency.name}</h2>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600 font-medium">
                    <span className="flex items-center gap-1"><UserIcon size={14} className="text-gray-400"/> {selectedAgency.contact_person || 'No Contact Person'}</span>
                    <span className="flex items-center gap-1"><Phone size={14} className="text-gray-400"/> {selectedAgency.phone || 'No Phone'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* 🟢 NEW: CREATE LOGIN BUTTON */}
                <button onClick={() => setShowCredsModal(true)} className="p-2.5 bg-[#05AC5F] text-white hover:bg-[#048C4F] rounded-lg transition-colors font-bold text-sm flex items-center gap-2 shadow-md shadow-[#05AC5F]/20">
                  <Key size={16}/> Create Login
                </button>

                <button onClick={() => handleOpenForm(selectedAgency)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-bold text-sm flex items-center gap-2"><Pencil size={16}/> Edit</button>
                <button onClick={() => handleDelete(selectedAgency._id, selectedAgency.name)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-bold text-sm flex items-center gap-2"><Trash2 size={16}/> Delete</button>
                <button onClick={() => setSelectedAgency(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 ml-2"><X className="h-6 w-6" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
              {/* Stats & Workers rendering (unchanged for brevity, same as previous code) */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"><div className="p-3 bg-white rounded-xl shadow-sm"><Users className="text-gray-600"/></div><div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Workers</p><p className="text-2xl font-black text-gray-900">{selectedAgency.total_workers}</p></div></div>
                <div className="bg-[#E8F8F0]/50 p-6 rounded-2xl border border-[#05AC5F]/10 shadow-sm flex items-center gap-4"><div className="p-3 bg-white rounded-xl shadow-sm"><CheckCircle className="text-[#05AC5F]"/></div><div><p className="text-[11px] font-bold text-[#048C4F] uppercase tracking-wider">Jobs Completed</p><p className="text-2xl font-black text-[#048C4F]">{selectedAgency.total_jobs_completed}</p></div></div>
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4"><div className="p-3 bg-white rounded-xl shadow-sm"><IndianRupee className="text-blue-600"/></div><div><p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Total Earnings</p><p className="text-2xl font-black text-blue-700">₹{(selectedAgency.total_earnings || 0).toLocaleString()}</p></div></div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Registered Workers</h3>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                {(() => {
                  const agencyWorkers = workers.filter(w => w.agency_id && w.agency_id._id === selectedAgency._id);
                  if (agencyWorkers.length === 0) return <div className="p-8 text-center text-gray-500 font-medium bg-gray-50">No workers registered to this agency yet.</div>;
                  return (
                    <div className="divide-y divide-gray-100">
                      {agencyWorkers.map(w => (
                        <div key={w._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#05AC5F] to-[#048C4F] flex items-center justify-center text-white font-bold shadow-sm">{w.full_name?.charAt(0).toUpperCase()}</div>
                            <div><p className="font-bold text-gray-900">{w.full_name}</p><p className="text-xs text-gray-500 font-medium">{w.phone || w.email}</p></div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${w.verification_status === 'approved' ? 'bg-[#E8F8F0] text-[#048C4F]' : w.verification_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>{w.verification_status}</span>
                            <p className="text-xs text-gray-400 mt-1.5 font-medium">Rating: <span className="font-bold text-amber-500">{w.rating || '0.0'} ★</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 NEW: CREDENTIALS MODAL */}
      {showCredsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-extrabold text-gray-800">Generate Franchise Login</h2>
              <button onClick={() => setShowCredsModal(false)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleCreateCredentials} className="p-6">
              <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold p-3 rounded-xl mb-5">
                This will create a Franchise Profile and a Supabase Auth account so they can log into the Web Dashboard.
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Agency Email *</label>
                  <input type="email" required value={credsData.email} onChange={(e) => setCredsData({...credsData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-medium transition-all" placeholder="agency@flasho.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Secure Password *</label>
                  <input type="password" required minLength="6" value={credsData.password} onChange={(e) => setCredsData({...credsData, password: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-medium transition-all" placeholder="Minimum 6 characters" />
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button type="button" onClick={() => setShowCredsModal(false)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm">Cancel</button>
                <button type="submit" disabled={isCreatingCreds} className="flex-1 px-4 py-3 bg-[#05AC5F] text-white rounded-xl hover:bg-[#048C4F] shadow-md shadow-[#05AC5F]/20 transition-all font-bold text-sm disabled:opacity-50">
                  {isCreatingCreds ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Modal (Unchanged for brevity, same as previous) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Agency Details' : 'Add New Agency'}</h2>
              <button onClick={() => setShowFormModal(false)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Agency Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F] outline-none text-sm font-medium" /></div>
                <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Person</label><input type="text" value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F] outline-none text-sm font-medium" /></div>
                <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F] outline-none text-sm font-medium" /></div>
                <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Address</label><textarea rows="3" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F] outline-none text-sm font-medium resize-none"></textarea></div>
              </div>
              <div className="mt-8 flex space-x-3">
                <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[#05AC5F] text-white rounded-xl font-bold text-sm">{editingId ? 'Save Changes' : 'Create Agency'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agencies;