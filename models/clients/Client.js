import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },

  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },

  agencyId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency'
  }],

  serviceAddress: {
    ville: { type: String, trim: true },  // ← Ajout
    arrondissement: { type: String, trim: true },
    secteur: { type: String, trim: true },
    quartier: { type: String, trim: true },
    rue: { type: String, trim: true },
    porte: { type: String, trim: true },
    couleurPorte: { type: String, trim: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    }
  },

  subscribedAgencyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agency' 
  },

  subscriptionStatus: {
    type: String,
    enum: ['active', 'pending', 'cancelled'],
    default: 'pending'
  },

  subscriptionHistory: [{
    date: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['active', 'pending', 'cancelled'], 
      required: true 
    },
    offer: { type: String, trim: true }
  }],

  paymentHistory: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, trim: true },
    status: { 
      type: String, 
      enum: ['success', 'pending', 'failed'], 
      required: true 
    }
  }],

  nonPassageReports: [{
    date: { type: Date, default: Date.now },
    comment: { type: String, trim: true }
  }],

  // Consentements
  termsAccepted: { 
    type: Boolean, 
    required: true 
  },

  receiveOffers: { 
    type: Boolean, 
    default: false 
  }

}, { timestamps: true });

// Index géospatial pour la géolocalisation
clientSchema.index({ 'serviceAddress.coordinates': '2dsphere' });

const Client = mongoose.model('Client', clientSchema);
export default Client;
