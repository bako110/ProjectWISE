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
    region: { type: String},           // Ex: "Centre"
    province: { type: String },         // Ex: "Kadiogo"
    commune: { type: String },          // Ex: "Ouagadougou"
    arrondissement: { type: String },                   // Ex: "Arrondissement 3"
    secteur: { type: String },                          // Ex: "Secteur 19"
    quartier: { type: String },                         // Ex: "Boulmiougou"
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
  }

}, { timestamps: true });

// Index géospatial pour les recherches par position
clientSchema.index({ 'serviceAddress.coordinates': '2dsphere' });

const Client = mongoose.model('Client', clientSchema);

export default Client;
