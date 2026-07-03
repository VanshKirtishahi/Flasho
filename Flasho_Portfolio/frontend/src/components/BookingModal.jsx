import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function BookingModal({ isOpen, onClose, selectedService }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Reset form when modal opens with a new service
  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        serviceId: selectedService?.id,
        serviceLabel: selectedService?.name,
      };

      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (apiUrl) {
        await axios.post(`${apiUrl}/booking`, payload);
      } else {
        await addDoc(collection(db, 'messages'), {
          ...payload,
          type: 'Booking',
          createdAt: serverTimestamp()
        });
      }
      
      toast.success("Booking received! We'll confirm shortly.");
      reset();
      onClose();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-secondary/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-xl text-secondary">Book Service</h3>
                <p className="text-primary text-sm font-medium mt-1">
                  {selectedService?.name || 'Service Booking'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-secondary shadow-sm hover:shadow transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Full Name</label>
                  <input 
                    type="text" 
                    {...register("name", { required: "Name is required" })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    {...register("phone", { 
                      required: "Phone is required",
                      minLength: { value: 10, message: "Must be at least 10 digits" }
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="+91 XXXXX XXXXX"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Preferred Date</label>
                  <input 
                    type="date" 
                    {...register("preferredDate", { required: "Date is required" })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Complete Address</label>
                  <textarea 
                    {...register("address", { required: "Address is required" })}
                    rows="2"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="House/Flat No., Street, Area, Kolhapur"
                  ></textarea>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Additional Notes (Optional)</label>
                  <input 
                    type="text" 
                    {...register("notes")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Any specific issue?"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-accent text-secondary font-bold text-lg py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                  {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
