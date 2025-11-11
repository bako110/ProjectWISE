const mongoose = require('mongoose');

const qrHistorySchema = new mongoose.Schema({
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // le collecteur
    required: true
  },
  collectedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QRHistory', qrHistorySchema);
