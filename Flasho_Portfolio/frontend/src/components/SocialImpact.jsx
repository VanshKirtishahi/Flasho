import { motion } from 'framer-motion';
const iconSustainable = 'https://res.cloudinary.com/dvywvz9xn/image/upload/v1782050785/sustainable_hp4a1n.svg';;
const iconLocal = 'https://res.cloudinary.com/dvywvz9xn/image/upload/v1782050591/local_dd5z2y.svg';;
const iconSkill = 'https://res.cloudinary.com/dvywvz9xn/image/upload/v1782050680/skill_hejnrq.svg';;
const iconCommunity = 'https://res.cloudinary.com/dvywvz9xn/image/upload/v1782050643/community_vuwkxu.svg';;

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const impacts = [
  { icon: iconSustainable, text: "Creating sustainable earning opportunities for skilled workers." },
  { icon: iconLocal, text: "Empowering local businesses to grow their customer base." },
  { icon: iconSkill, text: "Providing skill development and training for service partners." },
  { icon: iconCommunity, text: "Building a community based on trust and mutual growth." }
];

export default function SocialImpact() {
  return (
    <section id="social-impact" className="py-24 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeUpVariant}
              className="text-4xl md:text-5xl font-display font-bold text-secondary mb-6"
            >
              Driving Real Impact
            </motion.h2>
            <motion.p 
              variants={fadeUpVariant}
              className="text-lg text-muted mb-10"
            >
              Flasho isn't just about booking services. It's an ecosystem built to empower the local economy and organize the unorganized sector.
            </motion.p>
            
            <div className="space-y-6">
              {impacts.map((impact, index) => (
                <motion.div 
                  key={index}
                  variants={fadeUpVariant}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shrink-0 shadow-sm text-primary overflow-hidden p-2">
                    <img src={impact.icon} alt="Impact" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <p className="text-secondary font-medium pt-3">{impact.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="h-full"
          >
            <div className="bg-secondary text-white rounded-3xl p-10 md:p-12 h-full flex flex-col justify-center relative overflow-hidden shadow-xl">
              {/* Decorative quote mark */}
              <div className="absolute top-4 right-8 text-8xl text-white/5 font-display font-black">"</div>
              
              <div className="relative z-10">
                <p className="text-2xl md:text-3xl font-display font-medium leading-relaxed mb-8">
                  "Every skilled person deserves an opportunity to work, earn, and grow."
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center font-bold text-secondary text-xl">
                    YD
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg">Yashodip Devkar</h4>
                    <p className="text-primary text-sm">Founder & CEO, Flasho</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
