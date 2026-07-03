import { MessageCircle } from 'lucide-react';
import { InstagramIcon, FacebookIcon, TwitterIcon, YoutubeIcon, LinkedinIcon } from './SocialIcons';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Footer() {
  const [services, setServices] = useState([]);
  const [socialLinks, setSocialLinks] = useState({});

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
        console.error("Error fetching services in footer:", error);
      }
    };

    const fetchSocialLinks = async () => {
      try {
        const docRef = doc(db, 'settings', 'social_media');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSocialLinks(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching social links:", error);
      }
    };

    fetchServices();
    fetchSocialLinks();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#050505] text-gray-400 py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <img src="/flasho-logo.png" alt="Flasho" className="h-10 mb-4 brightness-0 invert opacity-90" />
            <p className="text-sm mb-6">Pass hai, fast hai.</p>
            <div className="flex space-x-4">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="text-gray-400 hover:text-primary transition-colors">
                  <InstagramIcon size={20} />
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="text-gray-400 hover:text-primary transition-colors">
                  <FacebookIcon size={20} />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter" className="text-gray-400 hover:text-primary transition-colors">
                  <TwitterIcon size={20} />
                </a>
              )}
              {socialLinks.whatsapp && (
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Message us on WhatsApp" className="text-gray-400 hover:text-primary transition-colors">
                  <MessageCircle size={20} />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="Subscribe to our YouTube channel" className="text-gray-400 hover:text-primary transition-colors">
                  <YoutubeIcon size={20} />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Connect with us on LinkedIn" className="text-gray-400 hover:text-primary transition-colors">
                  <LinkedinIcon size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/coverage" className="hover:text-primary transition-colors">Coverage Areas</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              {services.map(service => (
                <li key={service.id}>
                  <Link to={`/service/${service.id}`} state={{ service }} className="hover:text-primary transition-colors">
                    {service.preName ? `${service.preName} ` : ''}{service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>

          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Kolhapur, Maharashtra, India</li>
              <li>hello@flasho.services</li>
              <li>+91 7098251919</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-sm">
          <p className="text-center md:text-left">© 2026 Flasho. Building India's Future Service Ecosystem.</p>
        </div>
      </div>
    </footer>
  );
}
