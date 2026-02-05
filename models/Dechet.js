const mongoose = require('mongoose');

const dechetSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  icon: { type: String, trim: true },
  color: { type: String, trim: true },
  binColor: { type: String, trim: true },
  frequency: { type: String, trim: true },
  tips: { type: [String], default: [] },
  instructions: { type: [String], default: [] },
  acceptedItems: { type: [String], default: [] },
  rejectedItems: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Dechet', dechetSchema);

