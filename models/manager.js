// models/manager.js - VERSION AVEC isOwner
const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  // 🔗 Référence à l'agence
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agence', // Nom du modèle d'agence
  },

  // 🔗 Référence à l'utilisateur correspondant
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Lien vers le modèle User
    required: true,
  },

  // Nombre de managers associés à cette agence (optionnel)
  nbManager: {
    type: Number,
    default: 1,
    min: 1,
  },

  // Activité ou zone d'action du manager
  activity: {
    type: String,
    trim: true,
    default: '',
  },

  // 🔥 NOUVEAU CHAMP : Indique si c'est le propriétaire de l'agence
  isOwner: {
    type: Boolean,
    default: true, // Par défaut, ce n'est pas le propriétaire
  },

  // Statut du manager
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active',
  },

  // Dates
  createdate: { type: Date, default: Date.now },
  updatedate: { type: Date, default: Date.now },
  deletedate: { type: Date },
}, {
  timestamps: true, // ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model('Manager', managerSchema);