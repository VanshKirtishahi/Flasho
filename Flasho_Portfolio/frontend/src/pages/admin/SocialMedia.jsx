import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Save, MessageCircle } from 'lucide-react';
import { InstagramIcon, FacebookIcon, TwitterIcon, YoutubeIcon, LinkedinIcon } from '../../components/SocialIcons';

export default function SocialMedia() {
  const [links, setLinks] = useState({
    instagram: '',
    facebook: '',
    twitter: '',
    whatsapp: '',
    youtube: '',
    linkedin: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const docRef = doc(db, 'settings', 'social_media');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLinks({ ...links, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching social links:", error);
      }
    };
    fetchLinks();
  }, []);

  const handleChange = (e) => {
    setLinks({
      ...links,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'social_media'), links);
      toast.success("Social media links saved!");
    } catch (error) {
      console.error("Error saving social links:", error);
      toast.error("Failed to save links");
    } finally {
      setIsSaving(false);
    }
  };

  const socialInputs = [
    { name: 'instagram', icon: InstagramIcon, label: 'Instagram', placeholder: 'https://instagram.com/yourprofile' },
    { name: 'facebook', icon: FacebookIcon, label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
    { name: 'twitter', icon: TwitterIcon, label: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle' },
    { name: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', placeholder: 'https://wa.me/yournumber' },
    { name: 'youtube', icon: YoutubeIcon, label: 'YouTube', placeholder: 'https://youtube.com/c/yourchannel' },
    { name: 'linkedin', icon: LinkedinIcon, label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Manage Social Media</h1>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-accent text-secondary font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Links'}
        </button>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-[2rem] border border-white/10 max-w-3xl">
        <p className="text-gray-400 mb-8">
          Add your social media profile links here. These will be displayed in the footer of your website. Leave a field blank if you don't want to show that icon.
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          {socialInputs.map((social) => (
            <div key={social.name} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="w-40 flex items-center gap-3 text-sm font-bold text-gray-300">
                <social.icon size={20} />
                {social.label}
              </label>
              <input 
                type="url" 
                name={social.name}
                value={links[social.name] || ''}
                onChange={handleChange}
                className="flex-1 px-5 py-3 rounded-xl border border-white/10 bg-[#050505] text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder={social.placeholder}
              />
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}
