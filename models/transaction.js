const mongoose = require('mongoose');

// models/transaction.js

const transactionSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    customerMsisdn: { type: String, required: true },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    pricingId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Pricing', 
      required: true 
    },
    subscriptionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Subscription',
      default: null 
    },
    operator: { 
      type: String, 
      enum: ['ORANGE_MONEY', 'MOOV_MONEY'], 
      required: true 
    },
    walletId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Wallet', 
      required: true 
    },
    numberMonths: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    status: {
      type: String,
      enum: [
        'INITIATED',
        'OTP_PENDING',
        'COMPLETED',
        'COMPLETED_WITH_ERROR', // 👈 Nouveau
        'FAILED',
        'CANCELLED'
      ],
      default: 'INITIATED'
    },
    transactionId: { type: String }, // ID opérateur (Moov trans-id)
    operatorTransactionId: { type: String }, // ID final opérateur
    operatorResponse: { type: String }, // JSON stringifié
    errorCode: { type: String },
    errorMessage: { type: String },
    errorDetails: { type: String }, // 👈 Nouveau (pour erreurs post-paiement)
    completedAt: { type: Date },
    failedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
