const mongoose = require('mongoose');

const franchiseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  location_address: { 
    type: String, 
    required: true 
  },
  tax_id: { 
    type: String 
  },
  owner_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'closed'], 
    default: 'active' 
  },
  metrics: {
    total_revenue: { type: Number, default: 0 },
    total_expenses: { type: Number, default: 0 },
    active_workers: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Franchise', franchiseSchema);