import { motion } from 'framer-motion';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function JoinEcosystem({ onOpenPartnerModal }) {
  const scrollToServices = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cards = [
    {
      icon: "🏠",
      title: "For Customers",
      desc: "Get access to verified professionals for all your home and maintenance needs instantly.",
      btnText: "Explore Services",
      action: scrollToServices,
      btnClass: "bg-primary text-secondary hover:bg-accent",
    },
    {
      icon: "🔧",
      title: "For Professionals",
      desc: "Turn your skills into a reliable business. Get regular work, fair pay, and support.",
      btnText: "Join as Professional",
      action: () => onOpenPartnerModal('professional'),
      btnClass: "bg-white/10 text-white hover:bg-white hover:text-secondary",
    },
    {
      icon: "🏢",
      title: "For Businesses",
      desc: "End-to-end facility management and custom service solutions for your office.",
      btnText: "Partner With Us",
      action: () => onOpenPartnerModal('agency'),
      btnClass: "bg-white/10 text-white hover:bg-white hover:text-secondary",
    },
  ];

  return (
    <section id="join" className="py-24 bg-secondary text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
          >
            Join the Flasho Ecosystem
          </motion.h2>
          <motion.p 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-lg text-gray-400"
          >
            Whether you need a service, want to provide one, or are looking for business solutions—we have a place for you.
          </motion.p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {cards.map((card, index) => (
            <motion.div 
              key={index}
              variants={fadeUpVariant}
              className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary transition-all duration-300 rounded-2xl p-8 flex flex-col h-full group"
            >
              <div className="text-5xl mb-6">{card.icon}</div>
              <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-primary transition-colors">{card.title}</h3>
              <p className="text-gray-400 mb-8 flex-grow">{card.desc}</p>
              
              <button 
                onClick={card.action}
                className={`w-full py-3 px-4 font-bold rounded-xl transition-all duration-300 ${card.btnClass}`}
              >
                {card.btnText}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
