import React, { useState } from 'react';
import { Send, Image as ImageIcon, Tag, Megaphone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api'; // 🟢 IMPORT THE CENTRALIZED API CLIENT

const Marketing = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    imageUrl: '',
    discountCode: ''
  });
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error("Title and message are required!");
      return;
    }

    setIsSending(true);
    try {
      // 🟢 NO MORE MANUAL SESSIONS OR HEADERS - The API client handles it!
      await api.post('/admin/notifications/broadcast', formData);
      
      toast.success("Broadcast sent successfully to all users!");
      setFormData({ title: '', message: '', imageUrl: '', discountCode: '' }); 
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send broadcast");
      console.error("Broadcast Error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <Megaphone className="mr-3 text-[#05AC5F]" size={32} />
          Marketing & Broadcasts
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-2">
          Send rich push notifications and promotional offers to all subscribed app users.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT SIDE: FORM */}
        <div className="flex-1 p-8 border-r border-gray-100">
          <form onSubmit={handleSendBroadcast} className="space-y-6">
            
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Notification Title *
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={formData?.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-bold text-gray-900 transition-all"
                placeholder="e.g. Flash Sale! ⚡"
              />
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Notification Message *
              </label>
              <textarea
                required
                rows={3}
                maxLength={150}
                value={formData?.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-medium text-gray-800 transition-all resize-none"
                placeholder="e.g. Get 50% off all Plumbing services today!"
              />
            </div>

            {/* Image URL Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center">
                <ImageIcon size={14} className="mr-1.5" /> Hero Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData?.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-medium text-gray-800 transition-all"
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            {/* Promo Code Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center">
                <Tag size={14} className="mr-1.5" /> Attach Promo Code (Optional)
              </label>
              <input
                type="text"
                maxLength={15}
                value={formData?.discountCode}
                onChange={(e) => setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-bold text-[#05AC5F] transition-all uppercase"
                placeholder="e.g. SAVE50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center px-4 py-4 bg-[#05AC5F] hover:bg-[#048C4F] text-white rounded-xl shadow-lg shadow-[#05AC5F]/20 transition-all font-bold text-sm mt-4 disabled:opacity-70"
            >
              {isSending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>Blast to All Users <Send size={18} className="ml-2" /></>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: LIVE PREVIEW */}
        <div className="w-full md:w-80 bg-gray-50 p-8 flex flex-col items-center justify-center border-l border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 text-center">
            Live Preview
          </p>
          
          {/* Mock Phone Screen */}
          <div className="w-[260px] h-[520px] bg-white rounded-[35px] shadow-xl border-[6px] border-gray-900 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl mx-16"></div>
            
            {/* Mock Wallpaper */}
            <div className="flex-1 bg-gradient-to-br from-blue-100 to-purple-100 pt-16 px-4">
              
              {/* Mock Notification Banner */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/40">
                <div className="p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#05AC5F] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-xs">F</span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[13px] font-bold text-gray-900 truncate">
                      {formData?.title || 'Notification Title'}
                    </p>
                    <p className="text-[11px] font-medium text-gray-600 mt-0.5 leading-snug line-clamp-2">
                      {formData?.message || 'Your promotional message will appear here...'}
                    </p>
                  </div>
                </div>
                {formData?.imageUrl && (
                  <div className="w-full h-32 bg-gray-100 border-t border-gray-100">
                    <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Marketing;