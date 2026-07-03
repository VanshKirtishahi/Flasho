import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import { Plus, Trash2, Edit2, X, GripVertical, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Reorder } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';

export default function Services() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [hasReordered, setHasReordered] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [subServiceUploading, setSubServiceUploading] = useState(null);
  
  const { register, handleSubmit, reset, setValue, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      features: [{ value: '' }],
      subServices: []
    }
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: "features"
  });

  const { fields: subServiceFields, append: appendSubService, remove: removeSubService, update: updateSubService } = useFieldArray({
    control,
    name: "subServices"
  });
  
  const watchedSubServices = watch("subServices");

  const handleReorder = (newOrder) => {
    setServices(newOrder);
    setHasReordered(true);
  };

  const saveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const updatePromises = services.map((service, index) => {
        return setDoc(doc(db, 'services', service.id), { ...service, order: index + 1 });
      });
      await Promise.all(updatePromises);
      toast.success("Service sequence updated successfully!");
      setHasReordered(false);
      fetchServices();
    } catch (error) {
      console.error("Error saving sequence:", error);
      toast.error("Failed to save new sequence");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const fetchServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'services'));
      const srvs = querySnapshot.docs.map(doc => ({
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
      setServices(srvs);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openModal = (service = null) => {
    if (service) {
      setEditingId(service.id);
      setValue('name', service.name);
      setValue('id', service.id);
      setValue('preName', service.preName || '');
      setValue('image', service.image || '');
      setValue('gradient', service.gradient || 'from-gray-50 to-gray-100');
      setValue('order', service.order || 0);
      setValue('glow', service.glow || 'group-hover:bg-gray-400/20');
      setValue('features', service.features?.length ? service.features.map(f => ({ value: f })) : [{ value: '' }]);
      setValue('subServices', service.subServices || []);
      setImagePreview(service.image || '');
    } else {
      const taken = services.map(s => s.order);
      let firstAvail = 1;
      while (taken.includes(firstAvail)) firstAvail++;

      setEditingId(null);
      reset({
        name: '',
        preName: '',
        id: `custom_${Date.now()}`,
        image: '',
        order: firstAvail,
        gradient: 'from-gray-50 to-gray-100',
        glow: 'group-hover:bg-gray-400/20',
        features: [{ value: '' }],
        subServices: []
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
      } catch (err) {
        console.error("Error uploading image:", err);
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubServiceImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (file) {
      setSubServiceUploading(index);
      try {
        const url = await uploadImageToCloudinary(file);
        const currentSubServices = watch("subServices");
        const currentSub = currentSubServices[index] || {};
        updateSubService(index, { ...currentSub, image: url });
        toast.success("Sub-service image uploaded!");
      } catch (err) {
        console.error("Error uploading sub-service image:", err);
        toast.error("Failed to upload image");
      } finally {
        setSubServiceUploading(null);
      }
    }
  };

  const onSubmit = async (data) => {
    // If it's a new service but user didn't provide image, use a placeholder
    if (!data.image) {
      data.image = 'https://placehold.co/400x400/f5c400/1a1a2e?text=' + encodeURIComponent(data.name);
    }
    
    let finalGradient = data.gradient;
    let finalGlow = data.glow;
    
    if (!editingId) {
      const palettes = [
        { gradient: 'from-blue-50 to-cyan-50', glow: 'group-hover:bg-blue-400/20' },
        { gradient: 'from-emerald-50 to-teal-50', glow: 'group-hover:bg-emerald-400/20' },
        { gradient: 'from-rose-50 to-pink-50', glow: 'group-hover:bg-rose-400/20' },
        { gradient: 'from-amber-50 to-orange-50', glow: 'group-hover:bg-amber-400/20' },
        { gradient: 'from-purple-50 to-fuchsia-50', glow: 'group-hover:bg-purple-400/20' },
        { gradient: 'from-indigo-50 to-violet-50', glow: 'group-hover:bg-indigo-400/20' },
        { gradient: 'from-cyan-50 to-sky-50', glow: 'group-hover:bg-cyan-400/20' },
        { gradient: 'from-fuchsia-50 to-pink-50', glow: 'group-hover:bg-fuchsia-400/20' },
        { gradient: 'from-lime-50 to-green-50', glow: 'group-hover:bg-lime-400/20' }
      ];
      
      const usedGradients = services.map(s => s.gradient);
      const availablePalettes = palettes.filter(p => !usedGradients.includes(p.gradient));
      
      const selectedPalette = availablePalettes.length > 0 
        ? availablePalettes[Math.floor(Math.random() * availablePalettes.length)]
        : palettes[Math.floor(Math.random() * palettes.length)];
        
      finalGradient = selectedPalette.gradient;
      finalGlow = selectedPalette.glow;
    }
    
    const formattedData = {
      ...data,
      gradient: finalGradient,
      glow: finalGlow,
      features: data.features ? data.features.map(f => f.value).filter(f => f.trim() !== '') : []
    };
    
    try {
      if (formattedData.order > 0) {
        const conflictingService = services.find(s => s.id !== formattedData.id && s.order === formattedData.order);
        if (conflictingService) {
          await setDoc(doc(db, 'services', conflictingService.id), { ...conflictingService, order: 0 });
        }
      }

      await setDoc(doc(db, 'services', data.id), formattedData);
      fetchServices();
      toast.success(editingId ? "Service updated!" : "Service added!");
      closeModal();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteDoc(doc(db, 'services', id));
        fetchServices();
        toast.success("Service deleted");
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Manage Services</h1>
        <div className="flex gap-4">
          {hasReordered && (
            <button 
              onClick={saveOrder}
              disabled={isSavingOrder}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Save size={20} />
              {isSavingOrder ? 'Saving...' : 'Save Sequence'}
            </button>
          )}
          <button 
            onClick={() => openModal()}
            className="bg-primary hover:bg-accent text-secondary font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus size={20} />
            Add Service
          </button>
        </div>
      </div>

      <Reorder.Group axis="y" values={services} onReorder={handleReorder} className="flex flex-col gap-3">
        {services.map((service, index) => (
          <Reorder.Item 
            key={service.id} 
            value={service}
            className="relative bg-[#111111] rounded-2xl p-3 shadow-sm border border-white/10 flex items-center gap-4 cursor-grab active:cursor-grabbing group"
          >
            <div className="text-gray-500 group-hover:text-gray-300 transition-colors pl-2 cursor-grab active:cursor-grabbing">
              <GripVertical size={24} />
            </div>
            
            <div className="bg-[#050505]/50 border border-white/10 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
              #{index + 1}
            </div>
            
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br ${service.gradient} shrink-0`}>
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-10 h-10 object-contain drop-shadow-md"
                onError={(e) => { e.target.src = 'https://placehold.co/400x400/f5c400/1a1a2e?text=Svc' }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">
                {service.preName ? `${service.preName} ${service.name}` : service.name}
              </h3>
              <p className="text-xs text-gray-400 truncate">ID: {service.id}</p>
            </div>
            
            <div className="flex gap-2 pr-2 shrink-0">
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); openModal(service); }}
                className="w-10 h-10 bg-[#050505] border border-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(service.id); }}
                className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {isModalOpen && (() => {
        return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            <div className="bg-[#111111] rounded-[2rem] shadow-2xl border border-white/10 p-8 sm:p-12">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
                  {editingId ? 'Edit Service Details' : 'Create New Service'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-full p-3 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Info Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Service Pre Name (Optional)</label>
                    <input 
                      type="text" 
                      {...register("preName")}
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#050505] text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg"
                      placeholder="e.g. Expert, Premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Service Name</label>
                    <input 
                      type="text" 
                      {...register("name", { required: "Name is required" })}
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#050505] text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg"
                      placeholder="e.g. Plumber"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Service URL ID (for routing)</label>
                    <input 
                      type="text" 
                      {...register("id", { required: "ID is required" })}
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-[#050505] text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg"
                      placeholder="e.g. plumber"
                    />
                  </div>

                  <input type="hidden" {...register("order", { valueAsNumber: true })} />
                </div>

                {/* Icon Group */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Service Icon</label>
                  <div className="flex items-center gap-6 p-6 rounded-2xl border border-dashed border-white/20 bg-[#050505]">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 object-contain rounded-xl border border-white/10 bg-[#111111] shadow-sm p-2" />
                    ) : (
                      <div className="w-24 h-24 rounded-xl border border-white/10 bg-[#111111] flex items-center justify-center text-gray-500 text-sm">No Image</div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="flex-1 px-4 py-3 outline-none file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {isUploading && <span className="text-sm text-gray-500 font-medium">Uploading...</span>}
                  </div>
                </div>

                {/* What is Included Group */}
                <div className="bg-[#050505] p-6 sm:p-8 rounded-2xl border border-white/10">
                  <label className="block text-lg font-bold text-gray-300 mb-4">What is included?</label>
                  <div className="space-y-4">
                    {featureFields.map((field, index) => (
                      <div key={field.id} className="flex gap-3">
                        <div className="flex-1 relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{index + 1}.</span>
                          <input 
                            type="text" 
                            {...register(`features.${index}.value`)}
                            className="w-full pl-10 pr-4 py-4 rounded-xl border border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg text-white bg-[#111111]"
                            placeholder="e.g. Deep Filter Cleaning"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFeature(index)}
                          className="w-14 bg-[#111111] border border-white/10 text-red-500 flex items-center justify-center rounded-xl hover:bg-red-500/10 hover:border-red-500/30 transition-all shadow-sm"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => appendFeature({ value: '' })}
                      className="mt-6 text-sm font-bold bg-[#111111] border border-white/10 px-6 py-3 rounded-full hover:bg-primary/10 hover:border-primary/30 text-primary flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Plus size={18} /> Add New Feature
                    </button>
                  </div>
                </div>

                {/* Sub Services Group */}
                <div className="bg-[#050505] p-6 sm:p-8 rounded-2xl border border-white/10">
                  <label className="block text-lg font-bold text-gray-300 mb-4">Sub Services</label>
                  <p className="text-sm text-gray-400 mb-6">Add boxes that will appear on the service page.</p>
                  <div className="space-y-6">
                    {subServiceFields.map((field, index) => {
                      const currentImage = watchedSubServices?.[index]?.image;
                      const isUploadingSub = subServiceUploading === index;
                      return (
                        <div key={field.id} className="p-6 bg-[#111111] rounded-xl border border-white/10 relative">
                          <button 
                            type="button" 
                            onClick={() => removeSubService(index)}
                            className="absolute top-4 right-4 w-8 h-8 bg-red-500/10 text-red-500 flex items-center justify-center rounded-lg hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            <div>
                              <label className="block text-sm font-bold text-gray-300 mb-2">Name</label>
                              <input 
                                type="text" 
                                {...register(`subServices.${index}.name`, { required: true })}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none"
                                placeholder="e.g. Sofa Cleaning"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                              <input 
                                type="text" 
                                {...register(`subServices.${index}.description`)}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white outline-none"
                                placeholder="What is included in this sub-service?"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <label className="block text-sm font-bold text-gray-300 mb-2">Image</label>
                            <div className="flex items-center gap-4">
                              {currentImage ? (
                                <img src={currentImage} className="w-16 h-16 object-contain bg-[#050505] border border-white/10 rounded-lg p-1" alt="Sub-service" />
                              ) : (
                                <div className="w-16 h-16 bg-[#050505] border border-white/10 rounded-lg flex items-center justify-center text-xs text-gray-500">None</div>
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleSubServiceImageUpload(index, e)}
                                disabled={isUploadingSub}
                                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
                              />
                              {isUploadingSub && <span className="text-xs text-gray-500">Uploading...</span>}
                              {/* hidden input for react-hook-form to register the value */}
                              <input type="hidden" {...register(`subServices.${index}.image`)} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <button 
                      type="button"
                      onClick={() => appendSubService({ name: '', description: '', image: '' })}
                      className="text-sm font-bold bg-[#111111] border border-white/10 px-6 py-3 rounded-full hover:bg-primary/10 hover:border-primary/30 text-primary flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Plus size={18} /> Add Sub Service
                    </button>
                  </div>
                </div>

                {/* Hidden styling fields to retain data on edit */}
                <input type="hidden" {...register("gradient")} />
                <input type="hidden" {...register("glow")} />

                {/* Footer */}
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
                    {editingId ? 'Save All Changes' : 'Create Service'}
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
