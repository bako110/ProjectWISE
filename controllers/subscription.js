const SubscriptionService = require('../services/subscription.js');
const { getUserById } = require('../services/user.js');
const {notificationService} = require('../services/notification.service.js');
const logger = require('../utils/logger.js');

class SubscriptionController {

  /**
   * Créer un abonnement
   * @route POST /subscription/subscribe/:clientId/pricing/:pricingId
   */
  static async subscribe(req, res) {
    try {
      const { clientId, pricingId, month } = req.params;
      logger.info(`Création de l'abonnement pour le client ${clientId} et le plan tarifaire ${pricingId} et le nombre de mmoi ${month}`);
      if (!clientId || !pricingId || !month) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Crée l'abonnement via le service
      const subscription = await SubscriptionService.createSubscription({ clientId, pricingId, month });

      const user = await getUserById(clientId);
      logger.info(user);
      user.agencyId = subscription.agencyId;
      user.save();

      const message = `Vous êtes abonné avec succès pour ${month} mois.`;
      await notificationService.createNotification({
          user: clientId,
          message: message,
          type: 'Subscribed'
      });

      const messageAgency = `Un nouveau client s'est abonné à votre agence pour ${month} mois.`;
      await notificationService.createNotification({
          user: subscription.agencyId,
          message: messageAgency,
          type: 'Subscribed'
      });

      return res.status(201).json({
        message: 'Subscription created successfully',
        subscription
      });

    } catch (error) {
      // Gestion des erreurs spécifiques
      if (['Pricing plan not found', 'Agency not found'].includes(error.message)) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Insufficient balance') {
        return res.status(400).json({ message: error.message });
      }
      // Erreur serveur générale
      return res.status(500).json({ message: error.message });
    }
  }

  // Lister les abonnements d’un client
  static async getClientSubscriptions(req, res) {
    try {
      const { clientId } = req.params;
      const subscriptions = await SubscriptionService.getSubscriptionsByClient(clientId);
      res.status(200).json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lister tous les abonnements (admin)
  static async getAllSubscriptions(req, res) {
    try {
      const subscriptions = await SubscriptionService.getAllSubscriptions();
      res.status(200).json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Annuler un abonnement
  static async cancel(req, res) {
    try {
      const { subscriptionId } = req.params;
      const subscription = await SubscriptionService.cancelSubscription(subscriptionId);

      const message = `L'abonnement a été annuler avec succès.`;
      await notificationService.createNotification({
          user: subscription.clientId,
          message: message,
          type: 'Subscribed'
      });
      res.status(200).json({
        message: 'Subscription canceled successfully',
        subscription
      });
    } catch (error) {
      if (error.message === 'Subscription not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = SubscriptionController;
