const mongoose = require('mongoose');

const agenceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },

  agencyDescription: { type: String, default: '', trim: true },

  zoneActivite: { 
    type: String, 
    default: '', 
    trim: true 
  },

  // 🔗 Référence vers le client principal
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },

  // 🔗 Référence vers le collecteur principal
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collector', // ou 'Collector' si tu as un modèle spécifique
  },

  // 🔗 Référence vers l'utilisateur propriétaire/admin de l'agence
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  slogan: { 
    type: String, 
    default: '', 
    trim: true 
  },

  // 🔗 Référence aux gestionnaires (managers)
  gestionnaires: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
  }],

  // Documents liés à l'agence
  documents: [{
    type: String, // URL ou chemin vers le document
  }],

  // Statut de l’agence
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  },

  // Dates
  createdate: { type: Date, default: Date.now },
  updatedate: { type: Date, default: Date.now },
  deletedate: { type: Date },
}, {
  timestamps: true, // ajoute automatiquement createdAt et updatedAt
});

module.exports = mongoose.model('Agence', agenceSchema);
