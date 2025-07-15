import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },

  agencyId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency'
  }],

  serviceAddress: {
    region: { type: String },
    province: { type: String },
    commune: { type: String },
    arrondissement: { type: String },
    secteur: { type: String },
    quartier: { type: String },
    rue: { type: String },
    porte: { type: String },
    couleurPorte: { type: String },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    }
  },

  subscribedAgencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },

  subscriptionStatus: {
    type: String,
    enum: ['active', 'pending', 'cancelled'],
    default: 'pending'
  },

  // Historique des abonnements (dates, status, offres)
  subscriptionHistory: [{
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'pending', 'cancelled'], required: true },
    offer: { type: String }
  }],

  // Historique des paiements
  paymentHistory: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String }, // ex: 'Stripe', 'PayPal', 'Cash'
    status: { type: String, enum: ['success', 'pending', 'failed'], required: true }
  }],

  // Signalements de non-passage
  nonPassageReports: [{
    date: { type: Date, default: Date.now },
    comment: { type: String }
  }]

}, { timestamps: true });

// Index géospatial pour les recherches par position
clientSchema.index({ 'serviceAddress.coordinates': '2dsphere' });

const Client = mongoose.model('Client', clientSchema);

export default Client;
