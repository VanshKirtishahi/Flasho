import React, { useState, useEffect } from 'react';
import api from '../api'; // 🟢 IMPORT THE CENTRALIZED API CLIENT
import { Star, MessageSquare, Loader2, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AgencyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgencyReviews();
  }, []);

  const fetchAgencyReviews = async () => {
    try {
      // 🟢 NO MORE MANUAL SESSIONS OR HEADERS - The API client handles it!
      const res = await api.get('/agency/reviews');
      
      setReviews(res.data);
    } catch (error) {
      toast.error("Failed to load your team's reviews");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-[#00C896]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <Star className="mr-3 text-amber-400 fill-amber-400" size={28} />
            My Team's Feedback
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Read written reviews and ratings left for your professionals.</p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 border border-amber-100">
          <MessageSquare size={16} /> {reviews.length} Total Reviews
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
          <MessageSquare className="mx-auto text-gray-300 mb-3" size={40}/>
          <p className="text-gray-500 font-bold">Your team hasn't received any reviews yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate pr-4">
                    {review.booking_id?.service_title || 'Completed Service'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                    <Calendar size={12} /> {new Date(parseInt(review._id.substring(0, 8), 16) * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-2">
                  <span className="font-bold text-amber-700 text-sm">{review.rating}.0</span>
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* 🟢 WRITTEN FEEDBACK DISPLAY */}
              <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed italic">
                  "{review.review_text && review.review_text.trim() !== '' 
                    ? review.review_text 
                    : 'The customer submitted a star rating without written feedback.'}"
                </p>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-50">
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                    {review.worker_id?.full_name?.charAt(0) || <User size={16}/>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Professional</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{review.worker_id?.full_name || 'Unknown'}</p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}