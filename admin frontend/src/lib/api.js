import axios from 'axios';
import { supabase } from './supabase';

// 🟢 Dynamically pulls your live link, falls back to localhost for local testing
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// 🟢 AUTOMATION: Automatically fetches and attaches the Supabase token to EVERY request
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error("Failed to attach token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;