const Subscription = require('../models/subscription');
const User = require('../models/User');
const QRHistory = require('../models/QRHistory');
const logger = require('../utils/logger');

class QRValidationService {

  /**
   * Marque une collecte à partir du QR Code scanné par le collecteur
   * @param {string} qrData - Données du QR Code
   * @param {string} collectorId - ID du collecteur
   */
  static async collectSubscription(qrData, collectorId) {
    try {
      const data = JSON.parse(qrData);
      const { subscriptionId, clientId } = data;

      // Vérifier l'abonnement
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) throw new Error('Subscription not found');
      if (!subscription.isActive) throw new Error('Subscription is not active');

      // Vérifier le client
      const client = await User.findById(clientId);
      if (!client) throw new Error('User not found');

      // Créer l'entrée historique de collecte
      const history = new QRHistory({
        subscriptionId,
        clientId,
        collectorId
      });
      await history.save();

      return {
        message: 'Collection recorded successfully',
        clientName: client.lastName,
        subscriptionId,
        collectedAt: history.collectedAt
      };
    } catch (error) {
      logger.error(error);
      throw new Error(error.message);
    }
  }

  /**
   * Récupérer toutes les collectes d'un collecteur
   * @param {string} collectorId
   */
  static async getCollectorHistory(collectorId) {
    try {
      const history = await QRHistory.find({ collectorId })
        .populate('clientId', 'lastName firstName email')
        .populate('subscriptionId', 'startDate endDate')
        .sort({ collectedAt: -1 });
      return history;
    } catch (error) {
      logger.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = QRValidationService;
