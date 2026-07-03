import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import { Plus, Trash2, Edit2, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function Team() {
  const [team, setTeam] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  
  const currentOrder = watch('order');

  const fetchTeam = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'team'));
      const members = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA === 0 && orderB === 0) return 0;
        if (orderA === 0) return 1;
        if (orderB === 0) return -1;
        return orderA - orderB;
      });
      setTeam(members);
    } catch (error) {
      console.error("Error fetching team:", error);
      toast.error("Failed to load team");
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openModal = (member = null) => {
    if (member) {
      setEditingId(member.id);
      setValue('name', member.name);
      setValue('id', member.id);
      setValue('role', member.role);
      setValue('initials', member.initials);
      setValue('email', member.email || '');
      setValue('shortDesc', member.shortDesc);
      setValue('longDesc', member.longDesc);
      setValue('image', member.image || '');
      setValue('order', member.order || 0);
      setValue('isCEO', member.isCEO || false);
      setValue('gradient', member.gradient || 'from-emerald-500/10 to-teal-600/10');
      setValue('border', member.border || 'border-emerald-500/20');
      setValue('textHighlight', member.textHighlight || 'text-emerald-400');
      setImagePreview(member.image || '');
    } else {
      const taken = team.map(s => s.order);
      let firstAvail = 1;
      while (taken.includes(firstAvail)) firstAvail++;

      setEditingId(null);
      reset({
        name: '',
        id: `founder_${Date.now()}`,
        role: '',
        initials: '',
        email: '',
        shortDesc: '',
        longDesc: '',
        image: '',
        order: firstAvail,
        isCEO: false,
        gradient: 'from-emerald-500/10 to-teal-600/10',
        border: 'border-emerald-500/20',
        textHighlight: 'text-emerald-400'
      });
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setEditingId(null);
    setImagePreview('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadImageToCloudinary(file);
        setImagePreview(url);
        setValue('image', url);
        toast.success("Image uploaded successfully!");
      } catch (error) {
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      if (data.isCEO) {
        data.gradient = 'from-primary/20 to-green-600/20';
        data.border = 'border-primary/40';
        data.textHighlight = 'text-primary';
      } else {
        data.gradient = 'from-emerald-500/10 to-teal-600/10';
        data.border = 'border-emerald-500/20';
        data.textHighlight = 'text-emerald-400';
      }
      
      if (data.order > 0) {
        const conflictingMember = team.find(s => s.id !== data.id && s.order === data.order);
        if (conflictingMember) {
          await setDoc(doc(db, 'team', conflictingMember.id), { ...conflictingMember, order: 0 });
        }
      }

      await setDoc(doc(db, 'team', data.id), data);
      fetchTeam();
      toast.success(editingId ? "Team member updated!" : "Team member added!");
      closeModal();
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("Failed to save team member");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      try {
        await deleteDoc(doc(db, 'team', id));
        fetchTeam();
        toast.success("Team member deleted");
      } catch (error) {
        console.error("Error deleting team member:", error);
        toast.error("Failed to delete team member");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Manage Team (About Us)</h1>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-accent text-secondary font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div key={member.id} className="relative bg-[#111111] rounded-3xl p-6 shadow-sm border border-white/10 flex flex-col items-center text-center">
            
            <div className="absolute top-4 left-4 bg-[#050505] border border-white/10 text-gray-400 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
              #{member.order || '-'}
            </div>

            {member.image ? (
              <img src={member.image} alt={member.name} className={`w-28 h-28 object-cover rounded-full mb-4 border-2 ${member.border} ${member.isCEO ? 'shadow-[0_0_20px_rgba(46,175,77,0.4)]' : ''}`} />
            ) : (
              <div className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold mb-4 bg-black/50 border-2 ${member.border} ${member.textHighlight} ${member.isCEO ? 'shadow-[0_0_20px_rgba(46,175,77,0.4)]' : ''}`}>
                {member.initials}
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              {member.name} 
              {member.isCEO && <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Highlight</span>}
            </h3>
            <p className={`text-sm font-bold uppercase tracking-widest ${member.textHighlight} mb-6`}>{member.role}</p>
            
            <div className="w-full mt-auto flex gap-3">
              <button 
                onClick={() => openModal(member)}
                className="flex-1 bg-[#050505] border border-white/5 hover:bg-white/10 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Edit2 size={16} /> Edit
              </button>
              <button 
                onClick={() => handleDelete(member.id)}
                className="w-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center transition-colors shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {team.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No team members added yet. Click "Add Member" to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (() => {
        const totalBoxes = Math.max(team.length + (editingId ? 0 : 1), 1);
        const boxes = Array.from({ length: totalBoxes }, (_, i) => i + 1);
        const takenOrders = team.filter(s => s.id !== editingId).map(s => s.order);

        return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            <div className="bg-[#111111] rounded-[2rem] shadow-2xl border border-white/10 p-8 sm:p-12">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
                  {editingId ? 'Edit Team Member' : 'Add Team Member'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-full p-3 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      {...register("name", { required: "Name is required" })}
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#050505] text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Role / Title</label>
                    <input 
                      type="text" 
                      {...register("role", { required: "Role is required" })}
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#050505] text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Display Sequence</label>
                    <div className="flex flex-wrap gap-2">
                      {boxes.map(num => {
                        const isTaken = takenOrders.includes(num);
                        const isSelected = currentOrder === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setValue('order', num)}
                            title={isTaken ? 'Currently used by another member. Click to overwrite.' : ''}
                            className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-primary text-secondary shadow-[0_0_15px_rgba(46,175,77,0.4)] border border-primary scale-105' 
                                : isTaken 
                                  ? 'bg-[#1a1a05] text-yellow-500 border border-yellow-500/30 hover:border-yellow-400 hover:text-yellow-400 hover:bg-[#2a2a05]' 
                                  : 'bg-[#050505] text-white border border-white/10 hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                    <input type="hidden" {...register("order", { valueAsNumber: true })} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Initials (Fallback if no image)</label>
                    <input 
                      type="text" 
                      {...register("initials", { required: "Initials are required" })}
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#050505] text-white focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Email Address (For Contact Button)</label>
                    <input 
                      type="email" 
                      {...register("email")}
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#050505] text-white focus:ring-2 focus:ring-primary outline-none"
                      placeholder="founder@flasho.services"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Unique ID</label>
                    <input 
                      type="text" 
                      {...register("id")}
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#050505] text-gray-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Profile Photo (Optional)</label>
                  <div className="flex items-center gap-6 p-6 rounded-2xl border border-dashed border-white/20 bg-[#050505]">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-full border-2 border-white/10 shadow-sm" />
                    ) : (
                      <div className="w-24 h-24 rounded-full border border-white/10 bg-[#111111] flex items-center justify-center text-gray-500">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="flex-1 px-4 py-3 outline-none file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
                    />
                    {isUploading && <span className="text-sm text-gray-500 font-medium">Uploading...</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Short Description (Quote/Tagline)</label>
                  <input 
                    type="text" 
                    {...register("shortDesc", { required: "Short description is required" })}
                    className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#050505] text-white focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Long Biography</label>
                  <textarea 
                    {...register("longDesc", { required: "Biography is required" })}
                    rows="4"
                    className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#050505] text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="flex items-center gap-3 text-sm font-bold text-gray-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      {...register("isCEO")}
                      className="w-5 h-5 rounded border-white/10 bg-[#050505] text-primary focus:ring-primary focus:ring-offset-[#111111]"
                    />
                    Highlight as CEO / Key Founder (Adds special glowing effect)
                  </label>
                </div>

                {/* Hidden styling fields */}
                <input type="hidden" {...register("gradient")} />
                <input type="hidden" {...register("border")} />
                <input type="hidden" {...register("textHighlight")} />
                <input type="hidden" {...register("image")} />

                <div className="pt-8 mt-4 border-t border-white/10 flex justify-end gap-4">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="px-8 py-4 rounded-xl font-bold text-gray-400 bg-[#050505] border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-primary hover:bg-accent text-secondary font-bold px-12 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(46,175,77,0.3)]"
                  >
                    {editingId ? 'Save All Changes' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
