const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema({
  // 🔗 Référence à l'agence
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agence', // Nom du modèle de l'agence
    required: true,
  },

  // 🔗 Référence à l'utilisateur correspondant
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Lien vers le modèle User
    required: true,
  },

  // Planning ou horaires du collecteur
  planning: {
    type: String,
    trim: true,
    default: '',
  },

  // Zone de collecte ou type de collecte
  collection: {
    type: String,
    trim: true,
    default: '',
  },

  // Statut du collecteur
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

module.exports = mongoose.model('Collector', collectorSchema);
