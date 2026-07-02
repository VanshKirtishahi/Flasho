const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // 🟢 NEW: Links a sub-service to its parent core service
  parent_id: { type: String, default: null }, 
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  original_price: { type: Number },
  image: { type: String },
  description_image: { type: String },
  description: { type: String },
  includes: [{ type: String }],
  excludes: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);