import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  name: { type: String, required: true, trim: true },

  description: { type: String, default: '', trim: true },

  phone: { type: String, required: true, trim: true },

  email: { type: String, trim: true },

  logo: { type: String }, 

  address: {
    street: String,
    doorNumber: String,
    doorColor: String,
    neighborhood: String,
    city: String,
    postalCode: String,
    latitude: Number,
    longitude: Number,
  },

  serviceZones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceZone',
  }],

  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WasteService',
  }],

  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  }],

  schedule: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectionSchedule',
  }],

  rating: { type: Number, default: 0 },

  totalClients: { type: Number, default: 0 },

  termsAccepted: { type: Boolean, required: true },

  receiveOffers: { type: Boolean, default: false },

  isActive: { type: Boolean, default: false },

}, { timestamps: true });

const Agency = mongoose.model('Agency', agencySchema);
export default Agency;
