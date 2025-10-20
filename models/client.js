const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // 🔗 Référence à l'utilisateur
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Lien vers le modèle User
    required: true,
  },

  // ✅ QR code ou code image
  qrCode: { 
    type: String, 
    default: '' // lien vers une image ou Base64
  },

  // Statut du client
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

module.exports = mongoose.model('Client', clientSchema);
