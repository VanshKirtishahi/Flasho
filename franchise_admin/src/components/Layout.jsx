import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  // 🟢 ROUTE GUARD: If no token exists, immediately bounce them to Login
  const token = localStorage.getItem('franchise_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F6F7F9] overflow-hidden font-sans">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Fixed Topbar */}
        <Topbar />
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 custom-scrollbar">
          <Outlet /> {/* This is where Dashboard, Jobs, Workers, etc. will render */}
        </main>
      </div>
    </div>
  );
};

export default Layout;