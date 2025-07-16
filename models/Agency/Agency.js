import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  name: { 
    type: String, 
    required: true,
    trim: true
  },

  contactPerson: { 
    type: String,
    trim: true
  },

  phone: {
    type: String,
    trim: true
  },

  location: {
    ville: { type: String, trim: true },        // <-- ajouté ici
    arrondissement: { type: String, trim: true },
    secteur: { type: String, trim: true },
    quartier: { type: String, trim: true },
    rue: { type: String, trim: true },
  },

  licenseNumber: { 
    type: String, 
    unique: true,
    sparse: true,
    trim: true,
    default: null
  },

  description: { 
    type: String, 
    trim: true,
    default: ''
  },

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

  // Consentements obligatoires et optionnels
  termsAccepted: { 
    type: Boolean, 
    required: true 
  },

  receiveOffers: { 
    type: Boolean, 
    default: false 
  },

  isVerified: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

const Agency = mongoose.model('Agency', agencySchema);

export default Agency;
