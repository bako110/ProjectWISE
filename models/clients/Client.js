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

  address: {
    street: { type: String, trim: true, required: true },
    doorNumber: { type: String, trim: true, required: true },
    doorColor: { type: String, trim: true },
    arrondissement: { type: String, trim: true },
    sector: { type: String, trim: true },           // secteur ajouté
    neighborhood: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true },
    postalCode: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number }
  },

  subscribedAgencyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agency' 
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
  acceptTerms: { 
    type: Boolean, 
    required: true 
  },

  receiveOffers: { 
    type: Boolean, 
    default: false 
  }

}, { timestamps: true });

// ➤ Tu peux ajouter un index géospatial plus tard si latitude/longitude sont utilisés
// clientSchema.index({ 'address.location': '2dsphere' });

const Client = mongoose.model('Client', clientSchema);
export default Client;
