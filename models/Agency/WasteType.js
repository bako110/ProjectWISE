import mongoose from 'mongoose';

const wasteTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String },
  color: { type: String },

  instructions: [{ type: String }],
  acceptedItems: [{ type: String }],
  rejectedItems: [{ type: String }],
}, { timestamps: true });

const WasteType = mongoose.model('WasteType', wasteTypeSchema);
export default WasteType;
