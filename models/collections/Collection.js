import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: String,
  doorNumber: String,
  doorColor: String,
  neighborhood: String,
  city: String,
  postalCode: String,
  latitude: Number,
  longitude: Number
}, { _id: false });

const collectionSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },

  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },

  scheduledDate: {
    type: Date,
    required: true
  },

  collectedDate: {
    type: Date
  },

  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'missed', 'cancelled', 'reported'],
    default: 'scheduled'
  },

  address: addressSchema,

  wasteTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WasteType'
  }],

  notes: { type: String },

  photos: [String],

  rating: { type: Number, min: 1, max: 5 },

  feedback: { type: String }

}, { timestamps: true });

const Collection = mongoose.model('Collection', collectionSchema);
export default Collection;
