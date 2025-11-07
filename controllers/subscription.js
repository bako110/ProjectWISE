const SubscriptionService = require('../services/subscription.js');

class SubscriptionController {

  // Créer un abonnement
  static async subscribe(req, res) {
    try {
      const { clientId } = req.params; // <== depuis l'URL
      const { agencyId, pricingId, endDate } = req.body;

      // Vérification des champs obligatoires
      if (!clientId || !agencyId || !pricingId || !endDate) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Créer l'abonnement via le service (solde et validations incluses)
      const subscription = await SubscriptionService.createSubscription({
        clientId,
        agencyId,
        pricingId,
        endDate
      });

      res.status(201).json({
        message: 'Subscription created successfully',
        subscription
      });

    } catch (error) {
      // Gestion des erreurs spécifiques
      if (
        error.message === 'Pricing plan not found' ||
        error.message === 'Agency not found'
      ) {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === 'Insufficient balance') {
        return res.status(400).json({ message: error.message });
      }

      // Erreur serveur générale
      res.status(500).json({ message: error.message });
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
