const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review_text: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

// Ensure a client can only leave one review per booking
reviewSchema.index({ booking_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);