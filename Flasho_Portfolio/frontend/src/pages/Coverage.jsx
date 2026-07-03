import { useState, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import useSEO from '../hooks/useSEO';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const defaultCoverage = [
  { id: 'c1', city: 'Tarabai Park', areas: 'Rajaram Road, Tarabai Chowk, Udyam Nagar', isActive: true, order: 1 },
  { id: 'c2', city: 'Rajarampuri', areas: 'Rajarampuri 1st Lane to 11th Lane, Mangalwar Peth', isActive: true, order: 2 },
  { id: 'c3', city: 'Shivaji Park', areas: 'Shivaji Park Main, E Ward, D Ward area', isActive: true, order: 3 },
  { id: 'c4', city: 'Kasba Bawda', areas: 'Kasba Bawda Road, Bawda Chowk, New Shahupuri', isActive: true, order: 4 },
  { id: 'c5', city: 'Shahupuri', areas: 'Shahupuri Main, Station Road, Laxmipuri', isActive: true, order: 5 },
  { id: 'c6', city: 'Gandhinagar', areas: 'Gandhinagar Colony, Bhavani Mandap area', isActive: true, order: 6 },
  { id: 'c7', city: 'Rukadi', areas: 'Rukadi Main Road, MIDC Kolhapur areas', isActive: true, order: 7 },
  { id: 'c8', city: 'Nagala Park', areas: 'Nagala Park Main, Panchganga area', isActive: true, order: 8 },
  { id: 'c9', city: 'Padmaraj Nagar', areas: 'Padmaraj Nagar, Sangli Road area', isActive: false, order: 9 },
  { id: 'c10', city: 'Kalamba', areas: 'Kalamba Road, National Highway area', isActive: false, order: 10 },
];

export default function Coverage() {
  const [coverage, setCoverage] = useState([]);

  useSEO({
    title: 'Coverage Areas — Where Flasho Serves in Kolhapur | Home Services',
    description: 'Find out which areas of Kolhapur Flasho covers. We serve Tarabai Park, Rajarampuri, Shivaji Park, Kasba Bawda, Shahupuri and more. Expanding soon!',
    canonical: '/coverage',
  });

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'coverage'));
        if (querySnapshot.empty) {
          setCoverage(defaultCoverage);
        } else {
          const data = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setCoverage(data);
        }
      } catch (error) {
        console.error('Error fetching coverage:', error);
        setCoverage(defaultCoverage);
      }
    };
    fetchCoverage();
  }, []);

  const activeAreas = coverage.filter((c) => c.isActive);
  const comingSoon = coverage.filter((c) => !c.isActive);

  return (
    <div className="min-h-screen bg-[#050505] font-body pt-32 pb-24 overflow-hidden relative">
      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-[#27963C]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-8 backdrop-blur-sm">
            <MapPin size={14} className="text-primary" />
            Service Coverage
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white tracking-tight mb-6">
            Where We <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">Serve.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Flasho is rapidly expanding across Kolhapur. Check if we're available in your area — and if not, we're coming soon!
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-16"
        >
          {[
            { label: 'Active Areas', value: activeAreas.length, color: 'text-primary' },
            { label: 'Coming Soon', value: comingSoon.length, color: 'text-yellow-400' },
            { label: 'City', value: '1', color: 'text-blue-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <div className={`text-3xl font-display font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-gray-400 text-xs uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Active Areas */}
        {activeAreas.length > 0 && (
          <div className="mb-16">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
              className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3"
            >
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
              Currently Serving
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {activeAreas.map((area) => (
                <motion.div
                  key={area.id}
                  variants={fadeUpVariant}
                  className="group bg-[#111111] border border-white/10 hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 hover:bg-[#161616]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-bold text-lg leading-tight">{area.city}</h3>
                        <span className="bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Active</span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{area.areas}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Coming Soon */}
        {comingSoon.length > 0 && (
          <div>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
              className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3"
            >
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              Coming Soon
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {comingSoon.map((area) => (
                <motion.div
                  key={area.id}
                  variants={fadeUpVariant}
                  className="bg-[#111111]/60 border border-white/5 rounded-2xl p-6 opacity-70"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white/70 font-bold text-lg leading-tight">{area.city}</h3>
                        <span className="bg-yellow-400/10 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Soon</span>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">{area.areas}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-10 text-center"
        >
          <CheckCircle2 size={40} className="text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-display font-bold text-white mb-3">Don't see your area?</h3>
          <p className="text-gray-400 mb-6">We're expanding every week. Contact us and we'll let you know when we reach you.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-accent text-secondary font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(46,175,77,0.3)] hover:shadow-[0_0_30px_rgba(46,175,77,0.5)]"
          >
            Contact Us
          </a>
        </motion.div>

      </div>
    </div>
  );
}
