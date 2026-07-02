import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import axios from 'axios';

// Layout & Auth
import Layout from './components/Layout';
import Login from './pages/Login';

// Pages
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Workers from './pages/Workers';
import Financials from './pages/Financials';
import Settings from './pages/Settings';
import AgencyReviews from './pages/AgencyReviews';

// 🟢 THE SECURITY GATEKEEPER (Headless Auth Check)
function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        // Verify if the active session belongs to a valid Franchise/Agency User
        const res = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });

        // Check if the user has an assigned agency_id
        if (res?.data?.agency_id) {
          setSession(session);
        } else {
          // Sign out users immediately if they are not an agency member
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Authorization check failed", error);
        await supabase.auth.signOut();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg font-bold text-gray-500 animate-pulse">Verifying Access...</div>
      </div>
    );
  }

  // Reject access and kick to login if there is no valid session
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If verified, render the child components (your Layout)
  return children;
}

function App() {
  return (
    <Router>
      {/* 🟢 GLOBAL TOAST NOTIFICATIONS */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          },
          success: { style: { background: '#05AC5F' } },
          error: { style: { background: '#EF4444' } },
        }} 
      />

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* 🟢 PROTECTED ROUTES (Wrapped in ProtectedRoute and Layout) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="workers" element={<Workers />} />
          <Route path="financials" element={<Financials />} />
          <Route path="reviews" element={<AgencyReviews />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;