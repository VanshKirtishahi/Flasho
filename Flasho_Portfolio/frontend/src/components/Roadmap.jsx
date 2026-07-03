import { motion } from 'framer-motion';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const phases = [
  {
    id: 1,
    label: "Phase 1 🟢 LIVE",
    title: "Launch in Kolhapur",
    desc: "Core home services rollout, onboarding top 100 professionals.",
    isActive: true,
  },
  {
    id: 2,
    label: "Phase 2 🔵 NEXT",
    title: "App & AI Matching",
    desc: "Release dedicated mobile apps and AI-driven professional matching.",
    isActive: false,
  },
  {
    id: 3,
    label: "Phase 3 🟣 SOON",
    title: "Regional Expansion",
    desc: "Expanding services to Sangli, Satara, and Pune districts.",
    isActive: false,
  },
  {
    id: 4,
    label: "Phase 4 🔴 FUTURE",
    title: "B2B Ecosystem",
    desc: "Full B2B facility management and professional upskilling academy.",
    isActive: false,
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-4xl md:text-5xl font-display font-bold text-secondary mb-4"
          >
            Our Roadmap
          </motion.h2>
          <motion.p 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-lg text-muted"
          >
            The journey to building India's most trusted service ecosystem.
          </motion.p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="relative max-w-5xl mx-auto"
        >
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[50%] left-[10%] right-[10%] h-[4px] bg-gray-100 z-0 -translate-y-1/2"></div>
          <div className="hidden md:block absolute top-[50%] left-[10%] w-[25%] h-[4px] bg-primary z-0 -translate-y-1/2"></div>
          
          {/* Connecting Line (Mobile) */}
          <div className="md:hidden absolute top-[10%] bottom-[10%] left-[32px] w-[4px] bg-gray-100 z-0"></div>
          <div className="md:hidden absolute top-[10%] h-[25%] left-[32px] w-[4px] bg-primary z-0"></div>

          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-10">
            {phases.map((phase) => (
              <motion.div 
                key={phase.id}
                variants={fadeUpVariant}
                className="flex flex-row md:flex-col items-center flex-1 md:text-center group"
              >
                {/* Mobile specific layout wrapper */}
                <div className="w-16 h-16 md:hidden flex items-center justify-center shrink-0 bg-white z-10 relative">
                  <div className={`w-6 h-6 rounded-full border-4 ${phase.isActive ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}></div>
                </div>

                <div className={`p-6 rounded-2xl w-full md:w-auto shadow-sm transition-all duration-300 ${
                  phase.isActive 
                    ? 'bg-primary text-secondary md:-translate-y-2 md:shadow-xl' 
                    : 'bg-white border border-gray-200 text-secondary md:hover:-translate-y-1 md:hover:shadow-md'
                }`}>
                  <div className={`text-xs font-bold mb-3 ${phase.isActive ? 'text-secondary/80' : 'text-gray-500'}`}>
                    {phase.label}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">{phase.title}</h3>
                  <p className={`text-sm leading-relaxed ${phase.isActive ? 'text-secondary/90' : 'text-muted'}`}>
                    {phase.desc}
                  </p>
                </div>
                
                {/* Desktop dot */}
                <div className="hidden md:flex mt-6 h-10 w-10 bg-white items-center justify-center shrink-0 z-10 relative">
                  <div className={`w-6 h-6 rounded-full border-4 ${phase.isActive ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
