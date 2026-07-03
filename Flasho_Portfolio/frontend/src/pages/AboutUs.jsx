import { useLayoutEffect, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import useSEO from '../hooks/useSEO';

const initialFoundersData = [
  {
    id: 'vansh',
    name: 'Vansh Kirtishahi',
    role: 'Co-founder',
    initials: 'VK',
    shortDesc: 'Driving the mobile experience as our App Developer, ensuring Flasho is seamless and accessible.',
    longDesc: "Vansh is the technical powerhouse behind Flasho's mobile experience. With a deep passion for seamless UI/UX and robust application architecture, he ensures that both the customer and partner apps run flawlessly. His expertise in cross-platform development allows Flasho to deliver lightning-fast booking experiences directly to your smartphone.",
    gradient: 'from-emerald-500/10 to-teal-600/10',
    border: 'border-emerald-500/20',
    textHighlight: 'text-emerald-400'
  },
  {
    id: 'yashodip',
    name: 'Yashodip Devkar',
    role: 'Founder & CEO',
    initials: 'YD',
    shortDesc: '"Pass hai, Fast hai is more than a tagline; it\'s our commitment to speed, proximity, and trust."',
    longDesc: "Yashodip is the visionary force behind Flasho. Recognizing the disorganized state of local service industries, he set out to build a platform that guarantees trust, speed, and transparency. As CEO, Yashodip leads the company's strategic direction, focusing on scaling operations across India while maintaining an unyielding commitment to quality service delivery.",
    gradient: 'from-primary/20 to-green-600/20',
    border: 'border-primary/40',
    textHighlight: 'text-primary'
  },
  {
    id: 'shreyash',
    name: 'Shreyash Rakhunde',
    role: 'Co-founder',
    initials: 'SR',
    shortDesc: 'Leading our Social Media presence, Web Development, and Marketing strategies.',
    longDesc: "Shreyash bridges the gap between technology and people. Driving Flasho's digital presence, he manages web development and spearheads marketing campaigns that resonate with our local communities. Shreyash ensures that Flasho's message of reliable, fast service reaches every household, building a brand that people know and trust.",
    gradient: 'from-emerald-500/10 to-teal-600/10',
    border: 'border-emerald-500/20',
    textHighlight: 'text-emerald-400'
  }
];

export default function AboutUs() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useSEO({
    title: 'About Flasho — Our Story, Mission & Team | Kolhapur Home Services',
    description: "Learn about Flasho's journey — founded in Kolhapur, Maharashtra by Yashodip Devkar, Vansh Kirtishahi, and Shreyash Rakhunde. Our mission is to connect every household with trusted, verified service professionals.",
    canonical: '/about'
  });

  const [selectedFounder, setSelectedFounder] = useState(null);
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'team'));
        if (querySnapshot.empty) {
          setFounders(initialFoundersData);
        } else {
          const fetchedFounders = querySnapshot.docs.map(doc => ({
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
          setFounders(fetchedFounders);
        }
      } catch (error) {
        console.error("Error fetching founders:", error);
        setFounders(initialFoundersData);
      } finally {
        setLoading(false);
      }
    };
    fetchFounders();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-body pt-32 pb-24 overflow-hidden relative">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-[#27963C]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Pass hai, Fast hai
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-white tracking-tight mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">Story.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
            We started Flasho with a simple belief: finding a trusted professional for your home shouldn't be a struggle. We're bridging the gap between exceptional service providers and the people who need them.
          </p>
        </motion.div>

        {/* Journey Timeline Section */}
        <div className="relative max-w-5xl mx-auto mb-40 pt-10">
          {/* Vertical Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/80 via-primary/20 to-transparent -translate-x-1/2 rounded-full"></div>
          
          <div className="space-y-12 md:space-y-24">
            
            {/* Timeline Item 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="relative flex flex-col md:flex-row items-center"
            >
              <div className="md:w-1/2 flex justify-end md:pr-16 w-full pl-16 md:pl-0 mb-2 md:mb-0 text-left md:text-right">
                <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300 shadow-xl w-full">
                  <h3 className="text-2xl font-bold text-white mb-4">The Frustration & Planning</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    Back in 2024, the idea for Flasho was born out of personal frustration. We noticed how difficult it was to find reliable tradespeople. We started planning to build something that would completely change how local services are booked.
                  </p>
                </div>
              </div>
              
              <div className="absolute left-6 md:left-1/2 w-6 h-6 rounded-full bg-[#050505] border-4 border-primary transform -translate-x-1/2 flex items-center justify-center shadow-[0_0_15px_rgba(46,175,77,0.4)] z-10">
              </div>
              
              <div className="md:w-1/2 flex justify-start w-full pl-16 md:pl-16 mt-4 md:mt-0">
                <div className="text-primary font-bold tracking-[0.2em] uppercase text-xs">How It Started</div>
              </div>
            </motion.div>

            {/* Timeline Item 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative flex flex-col md:flex-row items-center"
            >
              <div className="md:w-1/2 flex justify-end md:pr-16 w-full pl-16 md:pl-0 mb-4 md:mb-0 order-2 md:order-1 mt-4 md:mt-0 text-left md:text-right">
                <div className="text-primary font-bold tracking-[0.2em] uppercase text-xs w-full">The Solution</div>
              </div>
              
              <div className="absolute left-6 md:left-1/2 w-6 h-6 rounded-full bg-[#050505] border-4 border-primary transform -translate-x-1/2 flex items-center justify-center shadow-[0_0_15px_rgba(46,175,77,0.4)] z-10">
              </div>
              
              <div className="md:w-1/2 flex justify-start w-full pl-16 md:pl-16 order-1 md:order-2">
                <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300 shadow-xl w-full">
                  <h3 className="text-2xl font-bold text-white mb-4">A Better Way</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    We knew there had to be a better way—a system that utilized modern technology to connect customers with verified, local professionals instantly. We set out to build a platform that guarantees trust, speed, and transparency.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Timeline Item 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative flex flex-col md:flex-row items-center"
            >
              <div className="md:w-1/2 flex justify-end md:pr-16 w-full pl-16 md:pl-0 mb-2 md:mb-0 text-left md:text-right">
                <div className="bg-gradient-to-br from-[#111111] to-primary/10 border border-primary/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(46,175,77,0.15)] w-full transform hover:-translate-y-1 transition-transform duration-300">
                  <h3 className="text-2xl font-bold text-white mb-4">Empowering Everyone</h3>
                  <p className="text-white/80 leading-relaxed text-lg">
                    For customers, it's about peace of mind and fast service. For our partner agencies and service personnel, it's about providing a steady stream of work, fair compensation, and the technological tools they need to grow their businesses.
                  </p>
                </div>
              </div>
              
              <div className="absolute left-6 md:left-1/2 w-8 h-8 rounded-full bg-primary border-4 border-[#050505] transform -translate-x-1/2 flex items-center justify-center shadow-[0_0_25px_rgba(46,175,77,0.8)] z-10">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              <div className="md:w-1/2 flex justify-start w-full pl-16 md:pl-16 mt-4 md:mt-0">
                <div className="text-white font-bold tracking-[0.2em] uppercase text-xs">Why We Do It</div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Team Section */}
        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Meet the Founders
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-2xl mx-auto mb-16">
            Click on a founder to learn more about the passionate minds driving the Flasho ecosystem.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {founders.map((founder, index) => (
              <motion.div 
                key={founder.id}
                variants={itemVariants} 
                onClick={() => setSelectedFounder(founder)}
                className={`cursor-pointer group relative bg-gradient-to-b ${founder.isCEO ? 'from-primary/10 to-[#111111] shadow-[0_0_40px_rgba(46,175,77,0.1)] transform md:-translate-y-4' : 'from-white/5 to-[#111111]'} border ${founder.isCEO ? 'border-primary/40' : 'border-white/10'} rounded-3xl p-8 hover:bg-[#151515] hover:border-white/30 transition-all duration-500 flex flex-col items-center text-center overflow-hidden`}
              >
                {/* Glow behind initials */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${founder.gradient} rounded-bl-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700`}></div>
                
                {founder.image ? (
                  <img src={founder.image} alt={founder.name} className={`w-28 h-28 object-cover rounded-full shadow-xl border-2 ${founder.border} relative z-10 group-hover:scale-110 transition-transform duration-300 mb-6`} loading="lazy" />
                ) : (
                  <div className={`w-28 h-28 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-4xl font-display font-bold ${founder.textHighlight} mb-6 shadow-xl border ${founder.border} relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                    {founder.initials}
                  </div>
                )}
                
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 relative z-10">{founder.name}</h3>
                <p className={`${founder.textHighlight} font-bold tracking-widest uppercase text-xs md:text-sm mb-6 relative z-10`}>{founder.role}</p>
                
                <div className="relative z-10 flex-grow flex items-center">
                  {founder.isCEO ? (
                    <div className="relative">
                      <span className={`${founder.textHighlight} text-4xl absolute -top-4 -left-2 opacity-30`}>"</span>
                      <p className="text-white/90 italic leading-relaxed px-4 mb-4">{founder.shortDesc}</p>
                      <span className={`${founder.textHighlight} text-4xl absolute -bottom-6 -right-0 opacity-30`}>"</span>
                    </div>
                  ) : (
                    <p className="text-gray-400 leading-relaxed">{founder.shortDesc}</p>
                  )}
                </div>
                
                <div className="mt-8 relative z-10">
                  <span className="text-sm font-semibold text-white/50 group-hover:text-white transition-colors duration-300 border-b border-transparent group-hover:border-white pb-1">Read Bio</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        )}
      </div>

      {/* Glassy Modal */}
      <AnimatePresence>
        {selectedFounder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFounder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedFounder(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-20"
              >
                <X size={20} />
              </button>

              {/* Photo/Visual Side */}
              <div className={`md:w-2/5 p-12 flex flex-col items-center justify-center relative bg-gradient-to-br ${selectedFounder.gradient} border-r border-white/5 overflow-hidden`}>
                {/* Decorative particles */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl mix-blend-overlay"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-black/20 rounded-full blur-2xl"></div>

                {selectedFounder.image ? (
                  <img src={selectedFounder.image} alt={selectedFounder.name} className={`w-40 h-40 md:w-56 md:h-56 object-cover rounded-[2.5rem] shadow-2xl border-2 ${selectedFounder.border} transform rotate-3 relative z-10`} loading="lazy" />
                ) : (
                  <div className={`w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] bg-black/40 backdrop-blur-lg flex items-center justify-center text-6xl md:text-8xl font-display font-extrabold ${selectedFounder.textHighlight} shadow-2xl border ${selectedFounder.border} transform rotate-3 relative z-10`}>
                    {selectedFounder.initials}
                  </div>
                )}
              </div>

              {/* Details Side */}
              <div className="md:w-3/5 p-10 md:p-14 flex flex-col justify-center">
                <p className={`${selectedFounder.textHighlight} font-bold tracking-widest uppercase text-sm mb-2`}>{selectedFounder.role}</p>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8">{selectedFounder.name}</h2>
                
                <div className="w-12 h-1 bg-white/10 rounded-full mb-8"></div>
                
                <p className="text-gray-300 text-lg leading-relaxed font-light">
                  {selectedFounder.longDesc}
                </p>
                
                <div className="mt-12 flex gap-4">
                  <a href={`mailto:${selectedFounder.email || 'hello@flasho.services'}`} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors text-sm">
                    Contact {selectedFounder.name.split(' ')[0]}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
