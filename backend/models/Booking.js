const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Client
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Partner
  rejected_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Tracks workers who rejected this task
  service_title: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: "General" },
  location: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  scheduled_date: { type: Date, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  
  // 🟢 NEW: Proof of Work Images (For Cloudinary URLs)
  before_image: { type: String, default: null },
  after_image: { type: String, default: null },
  
  // 🟢 NEW: Auto-generated OTP for starting the job
  otp: { type: String },

  status: {
    type: String,
    // 🟢 FIXED: Added 'dropped' to the enum array so workers can drop jobs safely!
    enum: ['pending', 'assigned', 'confirmed', 'in_progress', 'completed', 'cancelled', 'dropped'],
    default: 'pending'
  },
  created_at: { type: Date, default: Date.now }
});

// TTL Index for auto-expiring pending bookings after 30 minutes
BookingSchema.index(
  { created_at: 1 },
  {
    expireAfterSeconds: 1800,
    partialFilterExpression: { status: 'pending' }
  }
);

// 🟢 FIXED: Safe Pre-Save Hook (Ensures 'next' is passed properly)
BookingSchema.pre('save', function(next) {
  if (this.isNew && !this.otp) {
    // Generate a random 4-digit OTP
    this.otp = Math.floor(1000 + Math.random() * 9000).toString();
  }
  
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('Booking', BookingSchema);