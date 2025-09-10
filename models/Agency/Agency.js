import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: { type: String, required: true, trim: true },  // ajouté
  lastName: { type: String, required: true, trim: true },   // ajouté

  agencyName: { type: String, required: true, trim: true },

  agencyDescription: { type: String, default: '', trim: true },

  phone: { type: String, required: true, trim: true },
  address: {
    street: { type: String, trim: true },
    arrondissement: { type: String, trim: true },
    sector: { type: String, trim: true },
    neighborhood: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number }
  },


  logo: { type: String },

  licenseNumber: { type: String, required: true, unique: true },

  // 🔐 Membres de l'agence avec rôles
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'staff'],
      default: 'staff'
    }
  }],

  // Relations
  // serviceZones: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'ServiceZone',
  // }],

  // services: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'WasteService',
  // }],

  //pout le moment on ne garde que les services de collecte
  serviceZones: [{
    type: String,
  }],

    services: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    }],


  
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  }],

  schedule: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectionSchedule',
  }],

  // collectors: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Collector',
  // }],

  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  }],

  rating: { type: Number, default: 0 },

  totalClients: { type: Number, default: 0 },

  acceptTerms: { type: Boolean, required: true },

  receiveOffers: { type: Boolean, default: false },

  isActive: { type: Boolean, default: false }

}, { timestamps: true });

const Agency = mongoose.model('Agency', agencySchema);
export default Agency;
