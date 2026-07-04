import axios from 'axios';
import toast from 'react-hot-toast';

// Create a singleton axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // 15 second timeout to prevent infinite hanging
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  }
});

// 🟢 REQUEST INTERCEPTOR: Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('franchise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🟢 RESPONSE INTERCEPTOR: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response) {
      // If Token is expired or invalid, auto-logout
      if (response.status === 401) {
        localStorage.removeItem('franchise_token');
        localStorage.removeItem('franchise_data');
        window.location.href = '/login';
        toast.error("Session expired. Please log in again.");
      } 
      // Handle standard backend errors
      else if (response.data && response.data.error) {
        toast.error(response.data.error);
      } 
      else {
        toast.error("An unexpected server error occurred.");
      }
    } else if (error.request) {
      toast.error("Network Error: Please check your internet connection.");
    }

    return Promise.reject(error);
  }
);

export default api;