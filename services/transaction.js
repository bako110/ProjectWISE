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
    operator,
    pricingId,
    walletId,
    numberMonths
  }) {
    return Transaction.create({
      reference,
      amount,
      operator,
      customerMsisdn,
      userId,
      pricingId,
      numberMonths,
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
   * Mettre à jour une transaction
   */
  static async updateTransaction(transactionId, updates) {
    return Transaction.findByIdAndUpdate(
      transactionId,
      updates,
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

  static async linkSubscription(transactionId, subscriptionId) {
    return Transaction.findByIdAndUpdate(
      transactionId,
      { subscriptionId },
      { new: true }
    );
  }

  /**
   * Vérifier si une transaction peut créer un abonnement
   */
  static async canCreateSubscription(transactionId) {
    const tx = await Transaction.findById(transactionId);
    
    if (!tx) throw new Error('Transaction introuvable');
    if (tx.status !== 'COMPLETED') throw new Error('Transaction non complétée');
    if (tx.subscriptionId) throw new Error('Abonnement déjà créé pour cette transaction');
    
    return tx;
  }

  /**
   * Vérifier si l'opérateur et le numéro sont compatibles (Bénin)
   * 
   * MOOV: 01, 02, 03, 60, 61, 62, 63, 70, 71, 72, 73, 96, 97
   * ORANGE (MTN): 04, 05, 06, 07, 64, 65, 66, 67, 74, 75, 76, 77, 90, 91, 94, 95
   */
  static async verifyOperatorMsisdn(operator, msisdn) {
    // Nettoyer le numéro (enlever espaces, +229, etc.)
    const cleanMsisdn = msisdn.replace(/[\s\-\+]/g, '');
    
    // Enlever l'indicatif pays si présent (+229)
    const localNumber = cleanMsisdn.startsWith('226') 
      ? cleanMsisdn.substring(3) 
      : cleanMsisdn;

    // Vérifier format (8 chiffres)
    if (!/^\d{8}$/.test(localNumber)) {
      throw new Error('Le numéro doit contenir exactement 8 chiffres');
    }

    // Extraire les 2 premiers chiffres
    const prefix = localNumber.substring(0, 2);

    // Préfixes valides par opérateur
    const moovPrefixes = ['01', '02', '03', '50', '51', '52', '53', '60', '61', '62', '63', '70', '71', '72', '73'];
    const orangePrefixes = ['04', '05', '06', '07', '54', '55', '56', '57', '64', '65', '66', '67', '74', '75', '76', '77'];

    // Validation
    if (operator === 'MOOV_MONEY') {
      if (!moovPrefixes.includes(prefix)) {
        throw new Error(
          `Le numéro ${localNumber} ne correspond pas à Moov Money. ` 
          // `Préfixes valides: ${moovPrefixes.join(', ')}`
        );
      }
    } else if (operator === 'ORANGE_MONEY') {
      if (!orangePrefixes.includes(prefix)) {
        throw new Error(
          `Le numéro ${localNumber} ne correspond pas à Orange Money. ` 
          // `Préfixes valides: ${orangePrefixes.join(', ')}`
        );
      }
    } else {
      throw new Error('Opérateur non supporté. Utilisez MOOV_MONEY ou ORANGE_MONEY');
    }

    return true;
  }
}

module.exports = TransactionService;