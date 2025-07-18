import mongoose from 'mongoose';

const coordinateSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const serviceZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },

  boundaries: [coordinateSchema],

  neighborhoods: [{ type: String }],

  cities: [{ type: String }],

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ServiceZone = mongoose.model('ServiceZone', serviceZoneSchema);
export default ServiceZone;
