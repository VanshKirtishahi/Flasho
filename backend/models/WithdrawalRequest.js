const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  entity_type: { type: String, enum: ['worker', 'agency'], required: true },
  entity_name: { type: String, required: true },
  contact_info: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  payout_method: { type: String, enum: ['upi', 'bank'], required: true },
  payout_details: { type: Object, required: true }, // Stores { upi_id } OR { account_name, account_number, ifsc_code }
  
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);