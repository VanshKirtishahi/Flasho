import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data?.session) {
        // 🟢 CRITICAL FIX: Save using the new 'franchise_token' key
        localStorage.setItem('franchise_token', data.session.access_token);
        
        toast.success("Successfully logged in!");
        
        // 3. Redirect to the Dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      // Use the new sleek toast notifications instead of inline red text
      toast.error(err.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] font-sans p-4">
      <div className="max-w-md w-full">
        
        {/* BRANDING HEADER */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#05AC5F] rounded-2xl flex items-center justify-center shadow-lg shadow-[#05AC5F]/30 mb-5">
             <span className="text-white font-black text-3xl">F</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Flasho<span className="text-[#05AC5F]"> Franchise</span>
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-2 text-center">
            Sign in to your Franchise Management Dashboard
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* EMAIL INPUT */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Franchise Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-medium transition-all text-gray-800"
                  placeholder="manager@branch.com"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1 pr-1">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-[11px] font-bold text-[#05AC5F] hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#05AC5F]/20 focus:border-[#05AC5F] outline-none text-sm font-medium transition-all text-gray-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3.5 bg-[#05AC5F] hover:bg-[#048C4F] text-white rounded-xl shadow-md shadow-[#05AC5F]/20 transition-all font-bold text-sm disabled:opacity-70 mt-4"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>Sign In Securely <ArrowRight size={18} className="ml-2" /></>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs font-semibold text-gray-400 mt-8">
          Powered by Flasho Network Infrastructure
        </p>
      </div>
    </div>
  );
};

export default Login;