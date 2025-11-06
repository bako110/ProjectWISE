const Subscription = require('../models/subscription.js');

class SubscriptionService {
  
  // Créer un abonnement
  static async createSubscription({ clientId, agencyId, pricingId, startDate, endDate }) {
    try {
      const subscription = new Subscription({
        clientId,
        agencyId,
        pricingId,
        startDate: startDate || new Date(),
        endDate,
      });
      await subscription.save();
      return subscription;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Récupérer tous les abonnements d'un client
  static async getSubscriptionsByClient(clientId) {
    try {
      return await Subscription.find({ clientId })
        .populate('agencyId', 'name')
        .populate('pricingId', 'name price');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Récupérer tous les abonnements
  static async getAllSubscriptions() {
    try {
      return await Subscription.find()
        .populate('clientId', 'name email')
        .populate('agencyId', 'name')
        .populate('pricingId', 'name price');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Désactiver un abonnement
  static async cancelSubscription(subscriptionId) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) throw new Error('Subscription not found');
      subscription.isActive = false;
      await subscription.save();
      return subscription;
    } catch (error) {
      throw new Error(error.message);
    }
  }

}

module.exports = SubscriptionService;
