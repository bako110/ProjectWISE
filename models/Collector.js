import mongoose from 'mongoose';

const collectorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
  firstName: String,
  lastName: String,
  phone: String,
  assignedSectors: [String],
  vehicleInfo: {
    type: String,
    plateNumber: String,
  }
}, { timestamps: true });

const Collector = mongoose.model('Collector', collectorSchema);

export default Collector;
