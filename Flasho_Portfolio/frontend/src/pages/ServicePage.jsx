import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLayoutEffect, useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Star, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
const googlePlayImage = 'https://res.cloudinary.com/dvywvz9xn/image/upload/v1782050483/get-it-on-google-play_nsgzux.png';;
import useSEO from '../hooks/useSEO';

export default function ServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [service, setService] = useState(location.state?.service || null);
  const [loading, setLoading] = useState(!location.state?.service);

  useEffect(() => {
    const fetchService = async () => {
      if (location.state?.service) {
        return; // We already have the data instantly
      }
      try {
        const docRef = doc(db, 'services', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  useLayoutEffect(() => {
    // Scroll to top when loading the page
    window.scrollTo(0, 0);
  }, [id]);

  // Dynamic SEO per service
  useSEO({
    title: service
      ? `${service.preName ? service.preName + ' ' : ''}${service.name} in Kolhapur — Book Verified Professionals | Flasho`
      : 'Home Services in Kolhapur | Flasho',
    description: service
      ? `Book trusted ${service.name.toLowerCase()} professionals in Kolhapur through Flasho. ${service.features?.slice(0, 2).join(', ')}. Fast booking, transparent pricing. Download the app today!`
      : 'Book verified home service professionals in Kolhapur through Flasho.',
    canonical: `/service/${id}`
  });


  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div 
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pt-32 pb-20 text-center min-h-screen flex flex-col items-center justify-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted">Loading service details...</p>
        </motion.div>
      ) : !service ? (
        <motion.div 
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pt-32 pb-20 text-center min-h-screen flex flex-col items-center justify-center"
        >
          <h1 className="text-4xl font-display font-bold text-secondary mb-4">Service Not Found</h1>
          <button 
            onClick={() => navigate('/')}
            className="text-primary hover:underline font-medium"
          >
            Return to Home
          </button>
        </motion.div>
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-24 pb-20 min-h-screen bg-gray-50"
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate('/#services')}
            className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Services
          </button>

          {/* Hero Section */}
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 mb-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${service.gradient} rounded-bl-full -z-0 blur-2xl opacity-50`}></div>
            
            <div className="md:w-1/2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-primary rounded-full text-sm font-medium mb-6 border border-green-100">
                <Star className="w-4 h-4 fill-primary" /> 4.8 (2k+ Reviews)
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-secondary mb-6">
                {service.preName && (
                  <>
                    <span className="text-secondary">{service.preName}</span> <br/>
                  </>
                )}
                <span className="text-primary">{service.name}</span>
              </h1>
              <p className="text-lg text-muted mb-8 leading-relaxed">
                Transform your space with our expert {service.name.toLowerCase()} services. Vetted experts, safe chemicals, and sparkling results guaranteed.
              </p>
              <a href="#" className="inline-block transition-transform hover:scale-105 active:scale-95 shadow-sm rounded-lg overflow-hidden">
                <img src={googlePlayImage} alt="Get it on Google Play" className="h-20 w-auto object-contain" />
              </a>
            </div>

            <div className="md:w-1/2 flex justify-center relative z-10">
              <div className={`relative bg-gradient-to-br ${service.gradient} w-72 h-72 rounded-full flex items-center justify-center shadow-inner border border-white/60`}>
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-56 h-56 object-contain scale-[1.3] drop-shadow-2xl" 
                />
              </div>
            </div>
          </div>

          {/* Sub Services */}
          {service.subServices && service.subServices.length > 0 && (
            <div className="mb-20">
              <div className="flex flex-col items-center mb-12">
                <span className="text-primary font-semibold tracking-wider uppercase text-sm mb-2">Detailed Offerings</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary text-center">Explore Service Options</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/40 rounded-full mt-6"></div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {service.subServices.map((sub, idx) => {
                  return (
                    <div key={idx} className="group relative bg-[#fdfefd] rounded-[1.5rem] border border-[#e2efe2] hover:border-[#bde0bd] hover:shadow-[0_8px_30px_rgba(46,175,77,0.08)] transition-all duration-300 flex flex-row items-center p-3 gap-5 pr-6 cursor-pointer">
                      
                      {/* Left: Image Box */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.25rem] bg-[#53be62] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                        {sub.image ? (
                          <img src={sub.image} alt={sub.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <CheckCircle2 className="w-10 h-10 text-white/90 drop-shadow-md" />
                        )}
                      </div>

                      {/* Right: Details */}
                      <div className="flex flex-col flex-grow py-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-2 pr-10">
                          {sub.name}
                        </h3>
                        
                        {sub.description && (
                          <p className="text-gray-500 text-sm sm:text-sm leading-relaxed pr-8 line-clamp-2">
                            {sub.description}
                          </p>
                        )}
                      </div>

                      {/* Arrow Button */}
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#2eaf4d] flex items-center justify-center group-hover:bg-[#238c3c] transition-colors shadow-sm">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* What's Included */}
          {service.features && service.features.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-display font-bold text-secondary mb-10 text-center">What's Included</h2>
              <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm max-w-4xl mx-auto">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-muted">
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                      <span className="text-lg font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
        </motion.div>
      )}


    </AnimatePresence>
  );
}
