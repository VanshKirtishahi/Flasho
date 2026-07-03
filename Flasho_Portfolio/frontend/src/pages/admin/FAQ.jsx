import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, X, GripVertical, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Reorder } from 'framer-motion';

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [hasReordered, setHasReordered] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchFAQs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'faqs'));
      const data = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    }
  };

  useEffect(() => { fetchFAQs(); }, []);

  const handleReorder = (newOrder) => {
    setFaqs(newOrder);
    setHasReordered(true);
  };

  const saveOrder = async () => {
    setIsSavingOrder(true);
    try {
      await Promise.all(faqs.map((faq, index) =>
        setDoc(doc(db, 'faqs', faq.id), { ...faq, order: index + 1 })
      ));
      toast.success('Order saved!');
      setHasReordered(false);
      fetchFAQs();
    } catch {
      toast.error('Failed to save order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setValue('question', item.question);
      setValue('answer', item.answer);
      setValue('id', item.id);
      setValue('order', item.order || 0);
    } else {
      setEditingId(null);
      reset({ id: `faq_${Date.now()}`, question: '', answer: '', order: faqs.length + 1 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); reset(); setEditingId(null); };

  const onSubmit = async (data) => {
    try {
      await setDoc(doc(db, 'faqs', data.id), { ...data, order: Number(data.order) || faqs.length + 1 });
      fetchFAQs();
      toast.success(editingId ? 'FAQ updated!' : 'FAQ added!');
      closeModal();
    } catch {
      toast.error('Failed to save FAQ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this FAQ?')) {
      try {
        await deleteDoc(doc(db, 'faqs', id));
        fetchFAQs();
        toast.success('FAQ deleted');
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Manage FAQs</h1>
        <div className="flex gap-3">
          {hasReordered && (
            <button onClick={saveOrder} disabled={isSavingOrder} className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 py-3 rounded-xl flex items-center gap-2">
              <Save size={18} /> {isSavingOrder ? 'Saving...' : 'Save Order'}
            </button>
          )}
          <button onClick={() => openModal()} className="bg-primary hover:bg-accent text-secondary font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2">
            <Plus size={20} /> Add FAQ
          </button>
        </div>
      </div>

      <Reorder.Group axis="y" values={faqs} onReorder={handleReorder} className="flex flex-col gap-3">
        {faqs.map((faq, index) => (
          <Reorder.Item key={faq.id} value={faq} className="bg-[#111111] rounded-2xl p-4 border border-white/10 flex items-start gap-4 cursor-grab active:cursor-grabbing group">
            <div className="text-gray-500 group-hover:text-gray-300 pt-1 cursor-grab">
              <GripVertical size={20} />
            </div>
            <div className="bg-[#050505] border border-white/10 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold mb-1">{faq.question}</p>
              <p className="text-gray-400 text-sm line-clamp-2">{faq.answer}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.preventDefault(); e.stopPropagation(); openModal(faq); }} className="w-9 h-9 bg-[#050505] border border-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                <Edit2 size={15} />
              </button>
              <button onPointerDown={e => e.stopPropagation()} onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(faq.id); }} className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                <Trash2 size={15} />
              </button>
            </div>
          </Reorder.Item>
        ))}
        {faqs.length === 0 && (
          <div className="py-12 text-center text-gray-500">No FAQs yet. Add your first question!</div>
        )}
      </Reorder.Group>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-[#111111] rounded-[2rem] border border-white/10 p-8">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                <h2 className="text-2xl font-display font-bold text-white">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-full p-2 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Question</label>
                  <input type="text" {...register('question', { required: true })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. How do I book a service?" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Answer</label>
                  <textarea {...register('answer', { required: true })} rows={5} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Provide a clear, helpful answer..." />
                </div>
                <input type="hidden" {...register('id')} />
                <input type="hidden" {...register('order')} />
                <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                  <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-gray-400 bg-[#050505] border border-white/10 hover:bg-white/5">Cancel</button>
                  <button type="submit" className="bg-primary hover:bg-accent text-secondary font-bold px-10 py-3 rounded-xl">{editingId ? 'Save Changes' : 'Add FAQ'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
