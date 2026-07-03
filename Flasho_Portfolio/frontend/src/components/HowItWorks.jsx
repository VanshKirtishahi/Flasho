import { motion } from 'framer-motion';

const step1Img = 'https://res.cloudinary.com/dvywvz9xn/image/upload/v1782050531/Choose-Your-Service_iz1vh2.png';;
const step2Img = 'https://res.cloudinary.com/dvywvz9xn/image/upload/v1782050581/We-Find-the-Best-Match_ym2dpt.png';;
const step3Img = 'https://res.cloudinary.com/dvywvz9xn/image/upload/v1782050651/Professional-Assigned_sipk9i.png';;
const step4Img = 'https://res.cloudinary.com/dvywvz9xn/image/upload/v1782050630/Service-Delivered_cr3qqc.png';;

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const steps = [
  { step: 1, image: step1Img, title: "Choose Your Service", desc: "Select from our wide range of home and business services." },
  { step: 2, image: step2Img, title: "We Find the Best Match", desc: "Our algorithm pairs you with the perfect verified professional." },
  { step: 3, image: step3Img, title: "Professional Assigned", desc: "Get details of the pro assigned to your task instantly." },
  { step: 4, image: step4Img, title: "Service Delivered", desc: "Enjoy a hassle-free service experience right at your doorstep." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
          >
            How Flasho Works
          </motion.h2>
          <motion.p 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-lg text-gray-400"
          >
            Getting your work done is as easy as 1-2-3-4.
          </motion.p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="relative"
        >
          {/* Connecting line desktop */}
          <div className="hidden md:block absolute top-16 left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-gray-700 z-0"></div>
          
          {/* Connecting line mobile */}
          <div className="md:hidden absolute top-12 bottom-12 left-12 w-[2px] border-l-2 border-dashed border-gray-700 z-0"></div>

          <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-4">
            {steps.map((item) => (
              <motion.div 
                key={item.step}
                variants={fadeUpVariant}
                className="relative z-10 flex flex-row md:flex-col items-start md:items-center text-left md:text-center group flex-1"
              >
                <div className="mr-6 md:mr-0 md:mb-6 shrink-0 relative flex justify-center items-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-[#1A1A1A] rounded-full flex items-center justify-center border-2 border-gray-800 group-hover:border-primary transition-colors duration-300 shadow-xl relative z-10 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-[120%] h-[120%] object-contain scale-[1.3] group-hover:scale-[1.5] transition-transform duration-300 drop-shadow-md" 
                    loading="lazy" />
                  </div>
                  <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-8 h-8 md:w-10 md:h-10 bg-primary text-secondary font-bold rounded-full flex items-center justify-center text-sm md:text-base shadow-lg z-20">
                    {item.step}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-display font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
