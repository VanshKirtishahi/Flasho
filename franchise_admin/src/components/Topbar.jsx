import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, Menu, User, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ toggleSidebar, userData }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Safely extract user info or provide fallbacks
  const branchName = userData?.branchName || 'Downtown Branch';
  const roleName = userData?.role || 'Franchise Owner';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 z-20 shrink-0 relative">
      
      {/* ─── LEFT: MOBILE MENU & SEARCH ─── */}
      <div className="flex items-center flex-1">
        {/* Mobile Hamburger Icon */}
        <button 
          onClick={toggleSidebar}
          className="mr-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <div className="hidden sm:flex items-center bg-gray-50 px-4 py-2.5 rounded-xl w-full max-w-md border border-gray-200 focus-within:border-[#05AC5F]/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#05AC5F]/10 transition-all">
          <Search size={18} className="text-gray-400 mr-2 flex-shrink-0" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings, workers..." 
            className="bg-transparent border-none outline-none text-sm w-full text-gray-800 placeholder-gray-400 font-medium" 
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 ml-2">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ─── RIGHT: NOTIFICATIONS & PROFILE ─── */}
      <div className="flex items-center space-x-3 md:space-x-5">
        
        <button className="relative p-2.5 text-gray-500 hover:text-[#05AC5F] hover:bg-[#E8F8F0] rounded-full transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
        
        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center cursor-pointer p-1.5 pr-2 md:pr-3 rounded-xl transition-all border ${isDropdownOpen ? 'bg-gray-50 border-gray-200 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
          >
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(branchName)}&background=05AC5F&color=fff`} 
              alt="Profile" 
              className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 shadow-sm object-cover" 
            />
            <div className="ml-3 flex-col hidden md:flex text-left">
              <span className="text-sm font-bold text-gray-800 line-clamp-1">{branchName}</span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{roleName}</span>
            </div>
            <ChevronDown size={16} className={`ml-2 text-gray-400 transition-transform duration-200 hidden md:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Actual Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                <p className="text-sm font-bold text-gray-800 truncate">{branchName}</p>
                <p className="text-xs font-medium text-gray-500 truncate">{roleName}</p>
              </div>
              
              <button onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }} className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-[#05AC5F] hover:bg-gray-50 transition-colors">
                <User size={16} className="mr-3" /> My Profile
              </button>
              
              <button onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }} className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-[#05AC5F] hover:bg-gray-50 transition-colors">
                <Settings size={16} className="mr-3" /> Branch Settings
              </button>
              
              <div className="h-px bg-gray-100 my-1"></div>
              
              <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={16} className="mr-3" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;