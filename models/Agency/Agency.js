import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  name: { type: String, required: true },
  contactPerson: String,
  phone: String,

  location: {
    region: String,
    province: String,
    commune: String,
    arrondissement: String,
    secteur: String,
    quartier: String,
    rue: String,
  },

  licenseNumber: { type: String, unique: true },
  description: String,

  collectors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collector',
    },
  ],

  clients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  ],

  zones: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
    },
  ],

  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const Agency = mongoose.model('Agency', agencySchema);
export default Agency;
