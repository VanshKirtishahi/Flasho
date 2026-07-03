import acImage from '../assets/service-ac.png';
import cleanImage from '../assets/service-clean.png';
import electricianImage from '../assets/service-electrcian.png';
import paintingImage from '../assets/service-painting.png';
import pestImage from '../assets/pest-control.png';
import carpenterImage from '../assets/services-carpenter.png';
import carWashImage from '../assets/car-wash.png';

// The list of all services available, mapped in Services.jsx
export const services = [
  { 
    id: "cleaning", 
    image: cleanImage, 
    name: "Cleaning", 
    gradient: "from-emerald-50 to-teal-50",
    glow: "group-hover:bg-emerald-400/20",
    features: [
      "Deep vacuuming and dusting",
      "Kitchen and bathroom sanitization",
      "Floor scrubbing and mopping",
      "Window and glass cleaning",
      "Eco-friendly cleaning agents"
    ]
  },
  { 
    id: "ac_repair", 
    image: acImage, 
    name: "Appliance Repairing", 
    gradient: "from-blue-50 to-cyan-50",
    glow: "group-hover:bg-blue-400/20",
    features: [
      "Thorough diagnostics and troubleshooting",
      "Genuine spare parts replacement",
      "Performance tuning and testing",
      "Safety checks and wire inspections",
      "Post-repair cleanup"
    ]
  },
  { 
    id: "electrician", 
    image: electricianImage, 
    name: "Electrician", 
    gradient: "from-amber-50 to-orange-50",
    glow: "group-hover:bg-amber-400/20",
    features: [
      "Wiring and switch replacements",
      "Fixture installations (fans, lights)",
      "Fault finding and short circuit repair",
      "MCB and distribution board setup",
      "Safety and voltage checks"
    ]
  },
  { 
    id: "painting", 
    image: paintingImage, 
    name: "Painting", 
    gradient: "from-rose-50 to-pink-50",
    glow: "group-hover:bg-rose-400/20",
    features: [
      "Surface preparation and sanding",
      "Primer application and crack filling",
      "Premium quality paint application",
      "Post-painting cleanup",
      "Furniture masking and protection"
    ]
  },
  {
    id: "pest_control",
    image: pestImage,
    name: "Pest Control",
    gradient: "from-purple-50 to-fuchsia-50",
    glow: "group-hover:bg-purple-400/20",
    features: [
      "Comprehensive property inspection",
      "Targeted chemical treatment",
      "Eco-friendly and safe solutions",
      "Termite and rodent control",
      "Preventative measures consultation"
    ]
  },
  {
    id: "carpenter",
    image: carpenterImage,
    name: "Carpenter",
    gradient: "from-stone-50 to-orange-50",
    glow: "group-hover:bg-orange-400/20",
    features: [
      "Furniture assembly and repair",
      "Custom woodwork and fittings",
      "Door and window adjustments",
      "Lock installation and repair",
      "Polishing and finishing touches"
    ]
  },
  {
    id: "car_wash",
    image: carWashImage,
    name: "Car Wash",
    gradient: "from-cyan-50 to-blue-50",
    glow: "group-hover:bg-cyan-400/20",
    features: [
      "Exterior foam wash and wax",
      "Interior vacuuming and dusting",
      "Dashboard and door panel polishing",
      "Tire dressing and rim cleaning",
      "Glass streak-free cleaning"
    ]
  }
];
