const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact_person: { type: String },
  email: { type: String, default: '' }, // 🟢 Added to track agency email communications
  phone: { type: String },
  address: { type: String },
  completed_jobs: { type: Number, default: 0 }, // 🟢 Added to map completed service orders
  wallet_balance: { type: Number, default: 0 }, // 🟢 Added to store cumulative unpaid payouts
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agency', agencySchema);