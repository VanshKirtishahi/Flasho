const mongoose = require('mongoose');

// Sub-schema for user addresses
const addressSchema = new mongoose.Schema({
  name: String, 
  address: String, 
  city: String, 
  type: String, 
  latitude: Number, 
  longitude: Number
});

const userSchema = new mongoose.Schema({
  // 🟢 CORE AUTHENTICATION (Upgraded for Firebase)
  auth_id: { type: String, required: true, unique: true }, 
  phone: { type: String, required: true, unique: true }, // CRITICAL: Must be unique for OTP logins
  email: { type: String, default: '' },
  full_name: { type: String, required: true, default: 'User' },
  role: { type: String, enum: ['super_admin', 'franchise_owner', 'manager', 'worker', 'client'], default: 'client' },
  
  // 🟢 FRANCHISE & AGENCY CONTEXT
  franchise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Franchise', default: null },
  agency_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', default: null },
  
  // 🟢 PROFILE & ADDRESSES
  profile_image: { type: String, default: '' },
  addresses: [addressSchema],
  created_at: { type: Date, default: Date.now },

  // ==========================================
  // 🟢 WORKER-SPECIFIC KYC & DETAILS
  // ==========================================
  verification_status: { type: String, enum: ['unsubmitted', 'pending', 'approved', 'rejected'], default: 'unsubmitted' },
  is_verified: { type: Boolean, default: false },
  
  // Service Capabilities
  skills: [{ type: String }],
  custom_service: { type: String, default: '' },
  
  // Vehicle Info
  has_vehicle: { type: Boolean, default: false },
  vehicle_type: { type: String, default: 'none' },
  vehicle_number: { type: String, default: '' },
  
  // Documents
  govt_id_type: { type: String, default: 'Aadhar' },
  documents: {
    id_proof: { type: String, default: '' },
    license: { type: String, default: '' },
    vehicle_rc: { type: String, default: '' },
    govt_front: { type: String, default: '' },
    govt_back: { type: String, default: '' },
    selfie: { type: String, default: '' }
  },

  // ==========================================
  // 🟢 SMART MATCHING, METRICS & STATUS
  // ==========================================
  is_online: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },          
  completed_jobs: { type: Number, default: 0 },  
  wallet_balance: { type: Number, default: 0 },

  // Operational Bans/Suspensions
  is_blocked: { type: Boolean, default: false },
  block_reason: { type: String, default: '' },

  // Geolocation Tracking for nearby job matching
  live_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } 
  }
});

// Create 2dsphere index for fast geographical queries
userSchema.index({ live_location: "2dsphere" });

module.exports = mongoose.model('User', userSchema);