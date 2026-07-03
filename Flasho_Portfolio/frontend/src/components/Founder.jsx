import { motion } from 'framer-motion';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Founder() {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-4xl md:text-5xl font-display font-bold text-secondary mb-4"
          >
            Meet the Team
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-lg text-muted"
          >
            The passionate minds driving Flasho forward.
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
        >
          {/* Co-founder 2: Vansh (left) */}
          <motion.div variants={fadeUpVariant} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-2xl font-display font-bold text-primary mb-6 shadow-sm ring-4 ring-white">
              VK
            </div>
            <h3 className="font-display text-xl font-bold text-secondary mb-2">
              Vansh Kirtishahi
            </h3>
            <p className="text-primary font-medium mb-4">Co-founder</p>
            <p className="text-muted text-sm leading-relaxed px-4">
              Driving the mobile experience as our App Developer, ensuring Flasho is seamless and accessible on every device.
            </p>
          </motion.div>

          {/* Main Founder: Yashodip (Center) */}
          <motion.div variants={fadeUpVariant} className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-primary/20 text-center relative overflow-hidden transform lg:-translate-y-4">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-0"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-display font-bold text-primary mb-6 shadow-xl ring-4 ring-white">
                YD
              </div>

              <h2 className="font-display text-2xl font-bold text-secondary mb-1">
                Yashodip Devkar
              </h2>
              <p className="text-primary font-medium mb-8">Founder & CEO</p>

              <div className="relative">
                <span className="absolute -top-4 -left-6 text-4xl text-gray-200 font-display">"</span>
                <p className="text-lg text-secondary font-display italic mb-6 leading-relaxed px-2">
                  We started Flasho with a simple belief: finding a trusted professional for your home shouldn't be a struggle. Pass hai, Fast hai is more than a tagline; it's our commitment to speed, proximity, and trust.
                </p>
                <span className="absolute -bottom-6 -right-4 text-4xl text-gray-200 font-display">"</span>
              </div>

              <p className="text-muted text-sm">
                Our vision is to build an inclusive platform that empowers both customers and skilled professionals.
              </p>
            </div>
          </motion.div>
          {/* Co-founder 1: Shreyash (right) */}
          <motion.div variants={fadeUpVariant} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-2xl font-display font-bold text-primary mb-6 shadow-sm ring-4 ring-white">
              SR
            </div>
            <h3 className="font-display text-xl font-bold text-secondary mb-2">
              Shreyash Rakhunde
            </h3>
            <p className="text-primary font-medium mb-4">Co-founder</p>
            <p className="text-muted text-sm leading-relaxed px-4">
              Leading our Social Media presence, Web Development, and Marketing strategies to connect Flasho with the community.
            </p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
