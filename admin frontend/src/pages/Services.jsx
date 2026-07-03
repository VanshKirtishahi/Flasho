import { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, UploadCloud, Loader2, Edit2, Package, Tag, DollarSign, Image, FileText, CheckCircle, XCircle, Search, ChevronDown, ChevronRight, Layers } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingField, setUploadingField] = useState(null);
  
  // 🟢 Accordion toggle state for opening/closing sub-services
  const [expandedCores, setExpandedCores] = useState({}); 
  const [activeCoreId, setActiveCoreId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialFormState = { 
    title: '', category: '', price: '', original_price: '', 
    image: '', description_image: '', description: '', 
    includes: [''], excludes: [''], parent_id: null 
  };
  const [form, setForm] = useState(initialFormState);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await axios.get('http://localhost:5000/api/admin/services', { 
        headers: { Authorization: `Bearer ${session?.access_token}` } 
      });
      setServices(res.data || []);
      
      // Auto-expand all cores by default
      const expandMap = {};
      (res.data || []).filter(s => !s.parent_id).forEach(c => expandMap[c._id] = true);
      setExpandedCores(expandMap);
    } catch {
      toast.error("Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true); 
      setUploadingField(field); 
      toast.loading("Uploading image...", { id: "uploadToast" });
      
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
      const filePath = `admin_uploads/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('service_images').upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('service_images').getPublicUrl(filePath);
      setForm(prev => ({ ...prev, [field]: data.publicUrl }));
      toast.success("Image uploaded!", { id: "uploadToast" });
    } catch {
      toast.error("Failed to upload image", { id: "uploadToast" });
    } finally {
      setIsUploading(false); 
      setUploadingField(null);
    }
  };

  // 🟢 CORE vs SUB-SERVICE Handlers
  const handleAddCore = () => {
    setForm(initialFormState);
    setEditingId(null);
    setActiveCoreId(null);
    setIsModalOpen(true);
  };

  const handleAddSub = (coreService) => {
    setForm({ ...initialFormState, category: coreService.category, parent_id: coreService._id });
    setEditingId(null);
    setActiveCoreId(coreService._id);
    setIsModalOpen(true);
    
    // Auto-expand the accordion so they see it added
    setExpandedCores(prev => ({ ...prev, [coreService._id]: true }));
  };

  const handleEditClick = (service, coreId = null) => {
    setForm({
      title: service.title || '',
      category: service.category || '',
      price: service.price || '',
      original_price: service.original_price || '',
      image: service.image || '',
      description_image: service.description_image || '',
      description: service.description || '',
      includes: Array.isArray(service.includes) && service.includes.length > 0 ? service.includes : [''],
      excludes: Array.isArray(service.excludes) && service.excludes.length > 0 ? service.excludes : [''],
      parent_id: service.parent_id || null
    });
    setEditingId(service._id);
    setActiveCoreId(coreId);
    setIsModalOpen(true);
  };

  const toggleExpand = (coreId) => {
    setExpandedCores(prev => ({ ...prev, [coreId]: !prev[coreId] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedForm = { 
      ...form, 
      includes: form.includes.filter(i => i.trim()), 
      excludes: form.excludes.filter(i => i.trim()),
      parent_id: form.parent_id || null // Safely pass null for Core services
    };
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/services/${editingId}`, cleanedForm, { 
          headers: { Authorization: `Bearer ${session?.access_token}` } 
        });
        toast.success("Service updated successfully!");
      } else {
        await axios.post('http://localhost:5000/api/admin/services', cleanedForm, { 
          headers: { Authorization: `Bearer ${session?.access_token}` } 
        });
        toast.success(cleanedForm.parent_id ? "Sub-Service added!" : "Core Service added!");
      }
      
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save service");
    }
  };

  const handleDelete = async (id, isCore = false) => {
    if (!window.confirm(isCore ? "Delete this Core Service AND all its Sub-Services? This cannot be undone." : "Delete this Sub-Service?")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If it's a core service, delete all children first
      if (isCore) {
        const subs = services.filter(s => s.parent_id === id);
        for (let sub of subs) {
          await axios.delete(`http://localhost:5000/api/admin/services/${sub._id}`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
        }
      }

      await axios.delete(`http://localhost:5000/api/admin/services/${id}`, { 
        headers: { Authorization: `Bearer ${session?.access_token}` } 
      });
      toast.success("Deleted successfully");
      fetchServices();
    } catch { 
      toast.error("Failed to delete service"); 
    }
  };

  // 🟢 SMART SEARCH LOGIC (Keeps Cores visible if a Sub-Service matches the search)
  const coreServices = services.filter(s => {
    if (s.parent_id) return false; // Hide sub-services from the top loop
    if (!searchQuery) return true; // Show all if no search

    const coreMatches = s.title?.toLowerCase().includes(searchQuery.toLowerCase()) || s.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const childMatches = services.some(child => child.parent_id === s._id && (child.title?.toLowerCase().includes(searchQuery.toLowerCase()) || child.category?.toLowerCase().includes(searchQuery.toLowerCase())));

    return coreMatches || childMatches;
  });

  const discount = form.price && form.original_price ? Math.round((1 - form.price / form.original_price) * 100) : null;

  return (
    <div className="max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Service Catalog</h1>
          <p className="text-gray-500 font-medium mt-1">Create Parent Services and nest Sub-Services underneath them.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search catalog..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/20 transition-all shadow-sm" />
          </div>
          <button onClick={handleAddCore} className="flex shrink-0 items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00C896] to-[#009E78] text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#00C896]/30 transition-all">
            <Plus size={18}/> New Parent Service
          </button>
        </div>
      </div>

      {/* Catalog Display Section */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 size={40} className="animate-spin text-[#00C896] mb-4" />
          <p className="font-bold text-gray-500">Loading catalog tree...</p>
        </div>
      ) : coreServices.length === 0 ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Layers size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-bold text-gray-500">{searchQuery ? 'No matching services found' : 'Your catalog is empty. Create a Parent Service!'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {coreServices.map(core => {
            const subs = services.filter(s => s.parent_id === core._id);
            const isExpanded = expandedCores[core._id];

            return (
              <div key={core._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                {/* 🟢 CORE PARENT CARD */}
                <div className="p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 relative">
                      {core.image ? <img src={core.image} className="w-full h-full object-cover" alt="core" /> : <Package className="absolute inset-0 m-auto text-gray-300" size={32}/>}
                    </div>
                    <div>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-extrabold uppercase rounded-md mb-2 inline-block tracking-wider">{core.category}</span>
                      <h2 className="text-xl font-black text-gray-900 line-clamp-1">{core.title}</h2>
                      <p className="text-sm font-bold text-[#00C896] mt-1">Starting @ ₹{core.price}</p>
                    </div>
                  </div>

                  {/* Core Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <button onClick={() => handleEditClick(core)} className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors tooltip" title="Edit Parent"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(core._id, true)} className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-colors tooltip" title="Delete Parent & Subs"><Trash2 size={16}/></button>
                    <div className="w-px h-8 bg-gray-200 mx-1 hidden md:block"></div>
                    <button onClick={() => handleAddSub(core)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
                      <Plus size={14}/> Add Sub-Service
                    </button>
                    <button onClick={() => toggleExpand(core._id)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors shadow-sm w-36 justify-between">
                      {subs.length} Subs {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                    </button>
                  </div>
                </div>

                {/* 🟢 NESTED SUB-SERVICES ACCORDION */}
                {isExpanded && (
                  <div className="bg-gray-50/50 border-t border-gray-100 p-5 md:p-6">
                    {subs.length === 0 ? (
                      <div className="text-center py-8 bg-white border border-dashed border-gray-200 rounded-2xl">
                        <p className="text-sm text-gray-400 font-medium">No sub-services inside <span className="font-bold text-gray-600">{core.title}</span> yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {subs.map(sub => (
                          <div key={sub._id} className="bg-white p-4 rounded-2xl border border-gray-200 flex gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative group">
                            <img src={sub.image || 'https://via.placeholder.com/60'} className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0" alt="sub" />
                            <div className="flex-1 min-w-0 pr-6">
                              <h4 className="font-extrabold text-gray-900 text-sm truncate">{sub.title}</h4>
                              <p className="text-[11px] text-gray-500 mt-0.5 truncate">{sub.description || 'No description'}</p>
                              <div className="flex items-center gap-2 mt-2.5">
                                <span className="text-[#00C896] font-black text-sm">₹{sub.price}</span>
                                {sub.original_price && <span className="text-[10px] text-gray-400 line-through">₹{sub.original_price}</span>}
                              </div>
                            </div>
                            
                            {/* Hover Actions for Sub Service */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 bg-white/90 backdrop-blur p-1 rounded-xl border border-gray-100 shadow-sm">
                              <button onClick={() => handleEditClick(sub, core._id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14}/></button>
                              <button onClick={() => handleDelete(sub._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 🟢 MODAL OVERLAY (Used for both Core and Sub Services) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-10 pb-10">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className={`px-8 py-5 flex items-center justify-between border-b shrink-0 ${activeCoreId ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl text-white ${activeCoreId ? 'bg-indigo-500' : 'bg-[#00C896]'}`}>
                  {editingId ? <Edit2 size={20}/> : activeCoreId ? <Layers size={20}/> : <Plus size={20}/>}
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-xl">
                    {editingId ? 'Edit Details' : activeCoreId ? 'Create Sub-Service' : 'Create Parent Service'}
                  </h2>
                  <p className="text-xs font-bold mt-0.5 text-gray-500 uppercase tracking-wider">
                    {activeCoreId ? `Nesting under Category: ${form.category}` : 'Top-Level Catalog Entry'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-white hover:text-gray-900 rounded-full transition-colors bg-gray-100/50">
                <X size={20}/>
              </button>
            </div>

            {/* Form Body */}
            <div className="overflow-y-auto p-8">
              <form id="serviceForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2"><Package size={12} className="inline mr-1"/> {activeCoreId ? 'Sub-Service Name' : 'Parent Service Name'}</label>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder={activeCoreId ? "e.g. 1 BHK Deep Cleaning" : "e.g. Home Cleaning"} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2"><Tag size={12} className="inline mr-1"/> Category Label</label>
                    <input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. CLEANING" disabled={activeCoreId !== null} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2"><DollarSign size={12} className="inline mr-1"/> Sale Price (₹)</label>
                    <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="199" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-green-700 focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Original Price (₹)</label>
                    <input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} placeholder="299" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Discount Badge</label>
                    <div className={`w-full h-[46px] rounded-xl border flex items-center justify-center font-black text-lg ${discount ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      {discount ? `${discount}% OFF` : '—'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2"><FileText size={12} className="inline mr-1"/> Detailed Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe what this service entails..." rows="2" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] outline-none transition-all resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { field: 'image', label: 'Thumbnail Icon', hint: 'Square icon, 200x200px' },
                    { field: 'description_image', label: 'Description Banner', hint: 'Wide banner, 800x300px' }
                  ].map(({ field, label, hint }) => (
                    <div key={field}>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2"><Image size={12} className="inline mr-1"/> {label}</label>
                      <label className="block w-full border-2 border-dashed border-gray-200 hover:border-[#00C896] hover:bg-green-50/30 rounded-2xl p-4 cursor-pointer transition-colors text-center bg-gray-50/50">
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, field)} disabled={isUploading} className="hidden" />
                        {uploadingField === field ? (
                          <div className="flex flex-col items-center justify-center py-2 text-[#00C896]">
                            <Loader2 size={24} className="animate-spin mb-2" />
                            <span className="text-xs font-bold">Uploading...</span>
                          </div>
                        ) : form[field] ? (
                          <div className="flex items-center justify-center gap-4">
                            <img src={form[field]} alt="preview" className="h-14 rounded-lg border border-gray-200 object-cover shadow-sm" />
                            <div className="text-left">
                              <span className="block text-xs font-bold text-green-600">✓ Uploaded</span>
                              <span className="block text-[10px] text-gray-400 mt-1">Click to replace</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2">
                            <UploadCloud size={24} className="mx-auto text-gray-400 mb-2" />
                            <span className="block text-xs font-bold text-gray-600">Click to upload</span>
                            <span className="block text-[10px] text-gray-400 mt-1">{hint}</span>
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                  {[{ field: 'includes', title: "What's Included", color: 'green', icon: <CheckCircle size={14}/> }, { field: 'excludes', title: 'Not Included', color: 'red', icon: <XCircle size={14}/> }].map(({field, title, color, icon}) => (
                    <div key={field}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-${color}-600`}>{icon} {title}</h4>
                        <button type="button" onClick={() => setForm({...form, [field]: [...form[field], '']})} className={`px-2.5 py-1 text-[10px] font-bold bg-${color}-50 text-${color}-700 rounded-lg hover:bg-${color}-100 transition-colors`}>+ Add</button>
                      </div>
                      <div className="space-y-2">
                        {form[field].map((item, i) => (
                          <div key={i} className="flex gap-2 items-center group">
                            <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 shrink-0`} />
                            <input value={item} onChange={e => { const arr = [...form[field]]; arr[i] = e.target.value; setForm({...form, [field]: arr}); }} placeholder="Type item here..." className={`flex-1 text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-${color}-400 focus:ring-1 focus:ring-${color}-400 transition-shadow`} />
                            <button type="button" onClick={() => { const arr = [...form[field]]; arr.splice(i,1); setForm({...form, [field]: arr}); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><X size={14}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 shrink-0 bg-gray-50 flex gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-700 font-extrabold text-sm rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" form="serviceForm" disabled={isUploading} className={`flex-1 py-4 rounded-xl text-white font-extrabold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${activeCoreId ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-gradient-to-r from-[#00C896] to-[#009E78] hover:shadow-[#00C896]/30'} disabled:opacity-70 disabled:cursor-not-allowed`}>
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : editingId ? <Edit2 size={18}/> : activeCoreId ? <Layers size={18}/> : <Plus size={18}/>}
                {isUploading ? 'Processing...' : editingId ? 'Save Changes' : activeCoreId ? 'Publish Sub-Service' : 'Publish Core Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}