const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  franchise_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Franchise', 
    required: true 
  },
  // If you also track agency transactions, you might have this field:
  agency_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agency',
    default: null
  },
  // If a transaction belongs to a specific booking or user, it goes here:
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  category: { 
    type: String, 
    // 🟢 We removed the strict 'enum' here so it accepts 'payout', 'booking_fee', etc. without crashing
    required: true 
  }, 
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'completed' 
  },
  transaction_date: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);