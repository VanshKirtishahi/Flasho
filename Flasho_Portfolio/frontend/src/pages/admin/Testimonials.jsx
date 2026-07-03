import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import { Plus, Trash2, Edit2, X, Star, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchTestimonials = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'testimonials'));
      const data = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setValue('name', item.name);
      setValue('id', item.id);
      setValue('role', item.role);
      setValue('review', item.review);
      setValue('initials', item.initials || item.name?.charAt(0));
      setValue('order', item.order || 0);
      setValue('image', item.image || '');
      setSelectedRating(item.rating || 5);
      setImagePreview(item.image || '');
    } else {
      setEditingId(null);
      setSelectedRating(5);
      setImagePreview('');
      reset({
        id: `review_${Date.now()}`,
        name: '', role: '', review: '', initials: '', order: testimonials.length + 1, image: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setEditingId(null);
    setImagePreview('');
    setSelectedRating(5);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadImageToCloudinary(file);
        setImagePreview(url);
        setValue('image', url);
        toast.success('Image uploaded!');
      } catch {
        toast.error('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      await setDoc(doc(db, 'testimonials', data.id), {
        ...data,
        rating: selectedRating,
        order: Number(data.order) || testimonials.length + 1,
      });
      fetchTestimonials();
      toast.success(editingId ? 'Review updated!' : 'Review added!');
      closeModal();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this review?')) {
      try {
        await deleteDoc(doc(db, 'testimonials', id));
        fetchTestimonials();
        toast.success('Review deleted');
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Manage Testimonials</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary hover:bg-accent text-secondary font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={20} /> Add Review
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {testimonials.map((item) => (
          <div key={item.id} className="bg-[#111111] rounded-2xl p-4 border border-white/10 flex items-center gap-4">
            <div className="bg-[#050505] border border-white/10 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
              #{item.order}
            </div>
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/10" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {item.initials || item.name?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold">{item.name}</p>
              <p className="text-gray-400 text-xs mb-1">{item.role}</p>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= (item.rating||5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />)}
              </div>
            </div>
            <p className="text-gray-400 text-sm italic truncate max-w-xs hidden md:block">"{item.review}"</p>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openModal(item)} className="w-10 h-10 bg-[#050505] border border-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center transition-colors">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {testimonials.length === 0 && (
          <div className="py-12 text-center text-gray-500">No reviews yet. Add your first testimonial!</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-[#111111] rounded-[2rem] border border-white/10 p-8">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                <h2 className="text-2xl font-display font-bold text-white">
                  {editingId ? 'Edit Review' : 'Add Review'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-full p-2 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Customer Name</label>
                    <input type="text" {...register('name', { required: true })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Priya Sharma" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Role / Location</label>
                    <input type="text" {...register('role', { required: true })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Homeowner, Kolhapur" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Initials (for avatar fallback)</label>
                    <input type="text" {...register('initials')} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. PS" maxLength={2} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Display Order</label>
                    <input type="number" {...register('order')} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setSelectedRating(s)} className="transition-transform hover:scale-110">
                        <Star size={28} className={s <= selectedRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Review Text</label>
                  <textarea {...register('review', { required: true })} rows={4} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="What did the customer say?" />
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Profile Photo (Optional)</label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-white/20 bg-[#050505]">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="w-16 h-16 rounded-full border border-white/10 bg-[#111111] flex items-center justify-center text-gray-500">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer disabled:opacity-50" />
                    {isUploading && <span className="text-xs text-gray-500">Uploading...</span>}
                    <input type="hidden" {...register('image')} />
                  </div>
                </div>

                <input type="hidden" {...register('id')} />

                <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                  <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-gray-400 bg-[#050505] border border-white/10 hover:bg-white/5">Cancel</button>
                  <button type="submit" className="bg-primary hover:bg-accent text-secondary font-bold px-10 py-3 rounded-xl transition-all">
                    {editingId ? 'Save Changes' : 'Add Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
