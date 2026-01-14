const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // ===== Identification transaction =====
    reference: {
      type: String,
      required: true,
      unique: true, // ext_txn_id envoyé à Orange Money
    },

    // ===== Montant =====
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    // ===== Opérateur =====
    operateur: {
      type: String,
      enum: ['ORANGE_MONEY'],
      required: true,
    },

    // ===== Statut transaction =====
    status: {
      type: String,
      enum: [
        'INITIATED', // créée
        'OTP_PENDING', // attente OTP
        'PENDING', // envoyée à Orange Money
        'COMPLETED', // succès
        'FAILED', // échec
      ],
      default: 'INITIATED',
    },

    // ===== Données client =====
    customerMsisdn: {
      type: String,
      required: true,
    },

    // ===== Réponse Orange Money =====
    orangeTransactionId: {
      type: String, // OM170209.0927.C00001
    },

    orangeResponseCode: {
      type: String, // 200, 9014, etc.
    },

    orangeResponseMessage: {
      type: String,
    },

    otp: {
  type: String,
  select: false, // non retourné par défaut
},

failureReason: {
  type: String,
},


    // ===== Relations métier =====
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    tarifId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tarif',
      required: true,
    },

    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },

    // ===== Audit =====
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
