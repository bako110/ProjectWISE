const mongoose = require('mongoose');

const municipalityManagerSchema = new mongoose.Schema({
  // 🔗 Référence à l'utilisateur
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Lien vers le modèle User
    required: true,
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
  timestamps: true, // createdAt et updatedAt automatiques
});

module.exports = mongoose.model('MunicipalityManager', municipalityManagerSchema);
