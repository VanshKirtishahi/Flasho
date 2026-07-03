import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
const noAdminImage = 'https://res.cloudinary.com/dvywvz9xn/image/upload/v1782050566/no-admin-dashboard_hhldrh.png';;

export default function FakeAdmin() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-secondary py-12 px-4 text-center">
      {/* Image Container */}
      <div className="w-full max-w-2xl flex justify-center mb-8">
        <img 
          src={noAdminImage} 
          alt="No Admin Dashboard" 
          className="w-full h-auto max-h-[50vh] object-contain drop-shadow-2xl"
        />
      </div>
      
      {/* Button Below Image */}
      <div className="flex justify-center w-full">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg md:text-xl font-bold text-white transition-all duration-200 bg-primary hover:bg-accent rounded-xl shadow-[0_6px_0_#1C6B2F] hover:shadow-[0_3px_0_#1C6B2F] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px]"
        >
          <Home className="w-6 h-6" fill="currentColor" strokeWidth={1.5} />
          Return to Home
        </Link>
      </div>
    </div>
  );
}
