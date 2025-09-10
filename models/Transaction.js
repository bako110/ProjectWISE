import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
    amount: {
    type: Number,
    required: true
    },
    type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
    description: {
    type: String,
    },
    sourceWalletId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  destinationWalletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
    },
    status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
    },
    causedBy: {
    type: String,
    }

}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;