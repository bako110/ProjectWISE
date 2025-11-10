// services/qrValidationService.js
const Subscription = require('../models/subscription');
const User = require('../models/User');
const logger = require('../utils/logger');

class QRValidationService {

  /**
   * Valide un abonnement à partir du QR Code
   * @param {string} qrData - Les données du QR Code scanné
   */
  static async validateSubscription(qrData) {
    try {
      const data = JSON.parse(qrData);

      const { subscriptionId, clientId } = data;

      // Vérifier que l'abonnement existe et est actif
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) throw new Error('Subscription not found');
      if (!subscription.isActive) throw new Error('Subscription is not active');

      // Vérifier que le client existe
      const user = await User.findById(clientId);
      if (!user) throw new Error('User not found');

      // Ici, tu peux ajouter une logique pour enregistrer le passage du client
      // Par exemple, incrémenter un compteur de passages ou enregistrer la validation
      subscription.lastValidatedAt = new Date();
      await subscription.save();

      return {
        message: 'Subscription validated successfully',
        clientName: user.lastName,
        startDate: subscription.startDate,
        endDate: subscription.endDate
      };
    } catch (error) {
      logger.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = QRValidationService;
