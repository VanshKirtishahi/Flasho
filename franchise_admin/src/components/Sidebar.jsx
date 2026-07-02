import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CreditCard, 
  Settings,
  Star,
  X
} from 'lucide-react';

// ─── REUSABLE NAV ITEM ───
const NavItem = ({ to, icon, label, onClick }) => {
  return (
    <NavLink 
      to={to} 
      onClick={onClick} // Closes sidebar on mobile when a link is clicked
      className={({ isActive }) => 
        `flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-[#05AC5F] text-white shadow-md shadow-[#05AC5F]/20 font-bold' 
            : 'text-gray-500 hover:bg-[#E8F8F0] hover:text-[#05AC5F] font-semibold'
        }`
      }
    >
      <div className="transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <span className="ml-3 text-sm tracking-wide">{label}</span>
    </NavLink>
  );
};

// ─── MAIN SIDEBAR COMPONENT ───
const Sidebar = ({ isMobileOpen, closeSidebar }) => {
  return (
    <>
      {/* ─── MOBILE BACKDROP OVERLAY ─── */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ─── SIDEBAR CONTAINER ─── */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* BRANDING / LOGO AREA */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#05AC5F] rounded-lg flex items-center justify-center mr-3 shadow-md shadow-[#05AC5F]/30">
              <img src="src/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Flasho<span className="text-[#05AC5F]"> Franchise</span>
            </span>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={closeSidebar}
            className="md:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* MAIN NAVIGATION LINKS */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Menu</p>
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={closeSidebar} />
          <NavItem to="/workers" icon={<Users size={20} />} label="Workers" onClick={closeSidebar} />
          <NavItem to="/jobs" icon={<Briefcase size={20} />} label="Jobs & Tasks" onClick={closeSidebar} />
          <NavItem to="/financials" icon={<CreditCard size={20} />} label="Financials" onClick={closeSidebar} />
          <NavItem to="/reviews" icon={<Star size={20} />} label="Reviews" onClick={closeSidebar} />
        </div>

        {/* BOTTOM SECTION (SETTINGS) */}
        <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" onClick={closeSidebar} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;