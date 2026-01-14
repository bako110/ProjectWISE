const Transaction = require('../models/transaction.js');

class TransactionService {
  /**
   * Création transaction
   */
  static async createTransaction({
    reference,
    amount,
    customerMsisdn,
    userId,
    tarifId,
    walletId,
  }) {
    return Transaction.create({
      reference,
      amount,
      operateur: 'ORANGE_MONEY',
      customerMsisdn,
      userId,
      tarifId,
      walletId,
      status: 'INITIATED',
    });
  }

  /**
   * Passage en attente OTP
   */
  static async markOtpPending(transactionId) {
    return Transaction.findByIdAndUpdate(
      transactionId,
      { status: 'OTP_PENDING' },
      { new: true }
    );
  }

  /**
   * Appel réel Orange Money
   */
  static async sendToOrangeMoney(transactionId, omResponse) {
    return Transaction.findByIdAndUpdate(
      transactionId,
      {
        status: 'PENDING',
        orangeTransactionId: omResponse.orangeTransactionId,
        orangeResponseCode: omResponse.code,
        orangeResponseMessage: omResponse.message,
      },
      { new: true }
    );
  }

  /**
   * Succès
   */
  static async completeTransaction(transactionId, omResponse) {
    return Transaction.findByIdAndUpdate(
      transactionId,
      {
        status: 'COMPLETED',
        orangeTransactionId: omResponse.orangeTransactionId,
        orangeResponseCode: omResponse.code,
        orangeResponseMessage: omResponse.message,
        completedAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Échec
   */
  static async failTransaction(transactionId, code, message) {
    return Transaction.findByIdAndUpdate(
      transactionId,
      {
        status: 'FAILED',
        orangeResponseCode: code,
        orangeResponseMessage: message,
      },
      { new: true }
    );
  }

  /**
   * Recherche
   */
  static async getByReference(reference) {
    return Transaction.findOne({ reference });
  }
}

module.exports = TransactionService;