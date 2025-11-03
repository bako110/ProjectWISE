const mongoose = require('mongoose');

const agenceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    unique: true,
    required: true, 
    trim: true 
  },

  agencyDescription: { type: String, default: '', trim: true },

  zoneActivite: [{ 
    type: String, 
    default: '', 
    trim: true 
  }],

  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ou 'Collector' si tu as un modèle spécifique
  },


  slogan: { 
    type: String, 
    default: '', 
    trim: true 
  },

  gestionnaires: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  documents: [{
    type: String, // URL ou chemin vers le document
  }],

  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'inactive'
  },

  // address: {
  //   street: { type: String, trim: true },
  //   arrondissement: { type: String, trim: true },
  //   sector: { type: String, trim: true },
  //   doorNumber:     { type: String, trim: true },
  //   doorColor:      { type: String, trim: true },
  //   neighborhood: { type: String, trim: true },
  //   city: { type: String, trim: true },
  //   postalCode: { type: String, trim: true },
  //   latitude: { type: Number },
  //   longitude: { type: Number }
  //   location: {
  //   type: {
  //     type: String,
  //     enum: ['Point'],
  //     default: 'Point'
  //   },
  //   coordinates: {
  //     type: [Number], // [longitude, latitude]
  //     default: [0, 0]
  //   }
  // }
  // },
  
  deletedate: { type: Date },
}, {
  timestamps: true, // ajoute automatiquement createdAt et updatedAt
});

module.exports = mongoose.model('Agence', agenceSchema);
