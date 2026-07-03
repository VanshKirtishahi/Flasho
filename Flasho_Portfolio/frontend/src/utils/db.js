import { services as initialServices } from '../data/services';

const MESSAGES_KEY = 'flasho_messages';
const SERVICES_KEY = 'flasho_services';

export const db = {
  // --- Messages ---
  saveMessage: (data) => {
    const messages = db.getMessages();
    const newMessage = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return newMessage;
  },

  getMessages: () => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  deleteMessage: (id) => {
    let messages = db.getMessages();
    messages = messages.filter(m => m.id !== id);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  },

  // --- Services ---
  getServices: () => {
    const stored = localStorage.getItem(SERVICES_KEY);
    if (!stored) {
      // Seed with initial services if empty
      localStorage.setItem(SERVICES_KEY, JSON.stringify(initialServices));
      return initialServices;
    }
    const parsed = JSON.parse(stored);
    let updated = false;
    initialServices.forEach(service => {
      const existingIdx = parsed.findIndex(s => s.id === service.id);
      if (existingIdx === -1) {
        parsed.push(service);
        updated = true;
      } else if (!parsed[existingIdx].features && service.features) {
        parsed[existingIdx].features = service.features;
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(parsed));
    }
    return parsed;
  },

  saveService: (service) => {
    let services = db.getServices();
    
    if (service.id) {
      // Check if it exists
      const exists = services.some(s => s.id === service.id);
      if (exists) {
        // Update
        services = services.map(s => s.id === service.id ? service : s);
      } else {
        // Add new
        services.push(service);
      }
    } else {
      // Add new without ID
      service.id = Date.now().toString();
      services.push(service);
    }
    
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
    return service;
  },

  deleteService: (id) => {
    let services = db.getServices();
    services = services.filter(s => s.id !== id);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  }
};
