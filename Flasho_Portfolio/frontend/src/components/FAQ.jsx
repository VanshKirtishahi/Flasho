import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const defaultFAQs = [
  {
    id: 'faq1',
    question: 'What services does Flasho offer?',
    answer: 'Flasho offers a wide range of home services including Cleaning, AC Repair & Appliance Servicing, Electrician, Painting, Pest Control, Carpenter, and Car Wash — all in Kolhapur.',
    order: 1,
  },
  {
    id: 'faq2',
    question: 'How do I book a service?',
    answer: 'Simply download the Flasho app from Google Play, choose your service, select a convenient time slot, and a verified professional will arrive at your doorstep. It takes less than 60 seconds to book!',
    order: 2,
  },
  {
    id: 'faq3',
    question: 'Are the professionals verified and background-checked?',
    answer: 'Yes! Every professional on Flasho goes through a strict verification process including ID verification, skill assessment, and background checks before they are allowed on our platform.',
    order: 3,
  },
  {
    id: 'faq4',
    question: 'What is your pricing model?',
    answer: 'Flasho believes in 100% transparent pricing. You will always see the price before you confirm a booking — no hidden charges, no surprises. The price you see is the price you pay.',
    order: 4,
  },
  {
    id: 'faq5',
    question: 'What if I am not satisfied with the service?',
    answer: 'Customer satisfaction is our top priority. If you are not happy with the service, contact our support team within 24 hours and we will arrange a free re-service or a refund as per our policy.',
    order: 5,
  },
  {
    id: 'faq6',
    question: 'Which areas in Kolhapur does Flasho serve?',
    answer: 'Flasho currently serves most areas across Kolhapur city including Tarabai Park, Rajarampuri, Shivaji Park, Kasba Bawda, Shahupuri, and many more localities. Check our Coverage page for full details.',
    order: 6,
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <motion.div
      variants={fadeUpVariant}
      className="border border-white/10 rounded-2xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left group hover:bg-white/5 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <span className="text-white font-semibold text-base pr-8 group-hover:text-primary transition-colors">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-gray-400 group-hover:text-primary transition-colors"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5">
              <p className="pt-4">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'faqs'));
        if (querySnapshot.empty) {
          setFaqs(defaultFAQs);
          setOpenId('faq1');
        } else {
          const data = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setFaqs(data);
          setOpenId(data[0]?.id || null);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setFaqs(defaultFAQs);
        setOpenId('faq1');
      }
    };
    fetchFAQs();
  }, []);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section id="faq" className="py-24 bg-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4"
          >
            ❓ Got Questions?
          </motion.div>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpVariant}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUpVariant}
            className="text-lg text-gray-400"
          >
            Everything you need to know about Flasho.
          </motion.p>
        </div>

        {/* Accordion */}
        {faqs.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            className="space-y-3"
          >
            {faqs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => toggle(faq.id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
