import mongoose from 'mongoose';

const wasteServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },

  wasteTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WasteType',
  }],

  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    required: true
  },

  price: { type: Number, required: true },

  currency: { type: String, default: 'XOF' },

  isActive: { type: Boolean, default: true },

}, { timestamps: true });

const WasteService = mongoose.model('WasteService', wasteServiceSchema);
export default WasteService;
