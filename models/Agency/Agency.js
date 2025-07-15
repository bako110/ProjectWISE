import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  name: { type: String, required: true },
  contactPerson: String,
  phone: String,

  location: {
    region: { type: String},
    province: { type: String },
    commune: { type: String },
    arrondissement: { type: String },
    secteur: { type: String },
    quartier: { type: String },
    rue: { type: String }
  },

  licenseNumber: { type: String, unique: true },
  description: String,

  coveredAreas: [
    {
      region: String,
      province: String,
      commune: String,
      arrondissement: String,
      secteur: String,
      quartier: String,
    }
  ],

  // 🔗 Lien vers les collecteurs associés à cette agence
  // ...
    collectors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collector'
    }],

    clients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    }],


  isVerified: { type: Boolean, default: false }

}, { timestamps: true });

const Agency = mongoose.model('Agency', agencySchema);

export default Agency;
