const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  franchise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Franchise', required: true },
  issue_type: { type: String, required: true }, 
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
  resolution_notes: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);