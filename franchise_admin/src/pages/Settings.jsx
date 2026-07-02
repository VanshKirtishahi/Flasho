import React, { useState, useEffect } from 'react';
import { Save, Loader2, Store, User, MapPin, Phone, Mail } from 'lucide-react';
import api from '../api';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    branch_name: '',
    location_address: '',
    phone: '',
    email: '', // Readonly
    owner_name: '' // Readonly
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/franchiseDashboard/settings');
        const { user, franchise } = res.data;
        
        setFormData({
          branch_name: franchise.name || '',
          location_address: franchise.location_address || '',
          phone: user.phone || '',
          email: user.email || '',
          owner_name: user.full_name || ''
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      await api.put('/franchiseDashboard/settings', {
        branch_name: formData.branch_name,
        location_address: formData.location_address,
        phone: formData.phone
      });
      setMessage('✅ Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="w-8 h-8 text-[#05AC5F] animate-spin" /></div>;
  }

  return (
    <div className="pb-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Branch Settings</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Manage your physical franchise location and contact details.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${message.includes('✅') ? 'bg-[#E8F8F0] text-[#048C4F]' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* BRANCH INFO SECTION */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
            <Store className="w-5 h-5 text-[#05AC5F] mr-2" /> Franchise Details
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Branch Name</label>
              <input 
                type="text" required
                value={formData.branch_name}
                onChange={(e) => setFormData({...formData, branch_name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-bold text-gray-800 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Physical Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
                <textarea 
                  rows="3" required
                  value={formData.location_address}
                  onChange={(e) => setFormData({...formData, location_address: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-medium text-gray-800 resize-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* OWNER INFO SECTION */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
            <User className="w-5 h-5 text-blue-500 mr-2" /> Owner Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Owner Name (Read Only)</label>
              <input 
                type="text" readOnly
                value={formData.owner_name}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-sm font-bold text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Account Email (Read Only)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
                <input 
                  type="email" readOnly
                  value={formData.email}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-sm font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Contact Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
                <input 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-bold text-gray-800 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#05AC5F] hover:bg-[#048C4F] text-white rounded-xl shadow-md shadow-[#05AC5F]/20 transition-all font-bold text-sm disabled:opacity-70 flex items-center"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;