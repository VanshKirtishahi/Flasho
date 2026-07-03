import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, X, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function AdminCoverage() {
  const [coverage, setCoverage] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const isActive = watch('isActive');

  const fetchCoverage = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'coverage'));
      const data = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setCoverage(data);
    } catch (error) {
      console.error('Error fetching coverage:', error);
      toast.error('Failed to load coverage areas');
    }
  };

  useEffect(() => { fetchCoverage(); }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setValue('city', item.city);
      setValue('areas', item.areas);
      setValue('id', item.id);
      setValue('order', item.order || 0);
      setValue('isActive', item.isActive !== false);
    } else {
      setEditingId(null);
      reset({ id: `area_${Date.now()}`, city: '', areas: '', order: coverage.length + 1, isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); reset(); setEditingId(null); };

  const onSubmit = async (data) => {
    try {
      await setDoc(doc(db, 'coverage', data.id), {
        ...data,
        order: Number(data.order) || coverage.length + 1,
        isActive: Boolean(data.isActive),
      });
      fetchCoverage();
      toast.success(editingId ? 'Area updated!' : 'Area added!');
      closeModal();
    } catch (error) {
      console.error('Error saving coverage:', error);
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coverage area?')) {
      try {
        await deleteDoc(doc(db, 'coverage', id));
        fetchCoverage();
        toast.success('Area deleted');
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  const toggleActive = async (item) => {
    try {
      await setDoc(doc(db, 'coverage', item.id), { ...item, isActive: !item.isActive });
      fetchCoverage();
      toast.success(`Marked as ${!item.isActive ? 'Active' : 'Coming Soon'}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const activeAreas = coverage.filter(c => c.isActive);
  const comingSoon = coverage.filter(c => !c.isActive);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Manage Coverage Areas</h1>
          <p className="text-gray-400 text-sm mt-1">{activeAreas.length} active · {comingSoon.length} coming soon</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-accent text-secondary font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2">
          <Plus size={20} /> Add Area
        </button>
      </div>

      {/* Active */}
      {activeAreas.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Active
          </h2>
          <div className="flex flex-col gap-3">
            {activeAreas.map((item) => (
              <div key={item.id} className="bg-[#111111] rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold">{item.city}</p>
                  <p className="text-gray-400 text-sm truncate">{item.areas}</p>
                </div>
                <button onClick={() => toggleActive(item)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/15 text-primary hover:bg-red-500/15 hover:text-red-400 transition-colors shrink-0">
                  Active ✓
                </button>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openModal(item)} className="w-9 h-9 bg-[#050505] border border-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon */}
      {comingSoon.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Coming Soon
          </h2>
          <div className="flex flex-col gap-3">
            {comingSoon.map((item) => (
              <div key={item.id} className="bg-[#111111]/60 rounded-2xl p-4 border border-white/5 flex items-center gap-4 opacity-75">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 font-bold">{item.city}</p>
                  <p className="text-gray-500 text-sm truncate">{item.areas}</p>
                </div>
                <button onClick={() => toggleActive(item)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-yellow-400/10 text-yellow-400 hover:bg-primary/15 hover:text-primary transition-colors shrink-0">
                  Mark Active
                </button>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openModal(item)} className="w-9 h-9 bg-[#050505] border border-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {coverage.length === 0 && (
        <div className="py-12 text-center text-gray-500">No coverage areas yet. Add your first area!</div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-xl mx-auto px-4 py-12">
            <div className="bg-[#111111] rounded-[2rem] border border-white/10 p-8">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                <h2 className="text-2xl font-display font-bold text-white">{editingId ? 'Edit Area' : 'Add Coverage Area'}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-full p-2 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Area / Locality Name</label>
                  <input type="text" {...register('city', { required: true })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Tarabai Park" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Sub-areas / Zones (comma separated)</label>
                  <textarea {...register('areas', { required: true })} rows={3} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="e.g. Rajaram Road, Tarabai Chowk, Udyam Nagar" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Display Order</label>
                    <input type="number" {...register('order')} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-3 cursor-pointer pb-3">
                      <div
                        onClick={() => setValue('isActive', !isActive)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isActive ? 'bg-primary' : 'bg-gray-600'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-sm font-bold text-gray-300">{isActive ? 'Active' : 'Coming Soon'}</span>
                    </label>
                    <input type="hidden" {...register('isActive')} />
                  </div>
                </div>
                <input type="hidden" {...register('id')} />
                <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                  <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-gray-400 bg-[#050505] border border-white/10 hover:bg-white/5">Cancel</button>
                  <button type="submit" className="bg-primary hover:bg-accent text-secondary font-bold px-10 py-3 rounded-xl">{editingId ? 'Save Changes' : 'Add Area'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
