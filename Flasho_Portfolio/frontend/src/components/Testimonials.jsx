import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const defaultTestimonials = [
  {
    id: 't1',
    name: 'Priya Sharma',
    role: 'Homeowner, Kolhapur',
    rating: 5,
    review: 'Flasho made my AC servicing so easy! The technician arrived on time, was professional, and the pricing was totally transparent. No hidden charges at all.',
    initials: 'PS',
    order: 1,
  },
  {
    id: 't2',
    name: 'Rahul Patil',
    role: 'Business Owner, Kolhapur',
    rating: 5,
    review: 'We use Flasho for our office cleaning every week. The team is always punctual and the quality is consistently excellent. Highly recommended!',
    initials: 'RP',
    order: 2,
  },
  {
    id: 't3',
    name: 'Meera Desai',
    role: 'Resident, Kolhapur',
    rating: 5,
    review: 'The electrician sent by Flasho was skilled and very polite. Fixed our wiring issue within an hour. The booking process through the app was super smooth.',
    initials: 'MD',
    order: 3,
  },
  {
    id: 't4',
    name: 'Suresh Kulkarni',
    role: 'Flat Owner, Kolhapur',
    rating: 4,
    review: 'Got my home painted before Diwali through Flasho. Great quality of work, reasonable pricing, and the professionals cleaned up after finishing. Very happy!',
    initials: 'SK',
    order: 4,
  },
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'testimonials'));
        if (querySnapshot.empty) {
          setTestimonials(defaultTestimonials);
        } else {
          const data = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials(defaultTestimonials);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4"
          >
            ⭐ Customer Reviews
          </motion.div>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpVariant}
            className="text-4xl md:text-5xl font-display font-bold text-secondary mb-4"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpVariant}
            className="text-lg text-muted"
          >
            Real experiences from real customers across Kolhapur.
          </motion.p>
        </div>

        {/* Cards */}
        {testimonials.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.id}
                variants={fadeUpVariant}
                className="group bg-white border border-gray-100 rounded-[2rem] p-6 shadow-[0_4px_24px_rgb(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.10)] hover:border-primary/20 transition-all duration-500 flex flex-col"
              >
                <StarRating rating={t.rating || 5} />

                <p className="text-secondary text-sm leading-relaxed flex-grow mb-6 italic">
                  "{t.review}"
                </p>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {t.initials || t.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-secondary font-bold text-sm">{t.name}</p>
                    <p className="text-muted text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
