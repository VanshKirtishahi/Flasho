import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        const fetchedServices = querySnapshot.docs.map(doc => ({
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
        setServices(fetchedServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  const handleServiceClick = (service) => {
    navigate(`/service/${service.id}`, { state: { service } });
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-4xl md:text-5xl font-display font-bold text-secondary mb-4"
          >
            Services We Offer
          </motion.h2>
          <motion.p 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-lg text-muted"
          >
            From electrical fixes to deep cleaning — we've got it all.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="group relative bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-gray-100 hover:border-primary/20 transition-all duration-500 flex flex-col h-full cursor-pointer overflow-hidden"
            >
              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] pointer-events-none" />
              
              <div className={`relative bg-gradient-to-br ${service.gradient} rounded-[1.5rem] mb-8 p-6 flex items-center justify-center flex-grow min-h-[220px] shadow-inner transition-colors duration-500 border border-white/60`}>
                {/* Background glow effect behind image */}
                <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 opacity-0 group-hover:opacity-100 ${service.glow} scale-75 group-hover:scale-125`} />
                
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-48 h-48 object-contain scale-[1.5] drop-shadow-xl relative z-10 transition-transform duration-700 ease-out group-hover:scale-[1.65] group-hover:-translate-y-3" 
                loading="lazy" />
              </div>
              
              <div className="relative flex items-center justify-between w-full mt-auto">
                <h4 className="font-display font-bold text-lg text-secondary group-hover:text-primary transition-colors duration-300">
                  {service.preName && <span>{service.preName} </span>}
                  {service.name}
                </h4>
                <div className="bg-gray-50 group-hover:bg-primary group-hover:text-white text-gray-400 rounded-full p-2.5 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
