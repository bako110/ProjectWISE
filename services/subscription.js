const Subscription = require('../models/subscription.js');
const PricingService = require('../services/pricingAgency.js');
const WalletService = require('../services/wallet.js');
const mongoose = require('mongoose');

class SubscriptionService {

  /**
   * Créer un abonnement
   * @param {Object} param0
   * @param {string} param0.clientId - ID du client
   * @param {string} param0.pricingId - ID du plan tarifaire
   * @param {Date} param0.endDate - Date de fin de l'abonnement
   */
  static async createSubscription({ clientId, pricingId, endDate }) {
    try {
      if (!clientId) throw new Error('Client not found');
      if (!pricingId) throw new Error('Pricing plan not found');

      // Récupérer le pricing
      const pricing = await PricingService.getPricingById(pricingId);
      if (!pricing) throw new Error('Pricing plan not f ound');

      // Récupérer l'agence associée
      const agencyId = pricing.agencyId;
      if (!agencyId) throw new Error('Agency not found');

      // Vérifier le wallet du client
      const wallet = await WalletService.getWalletByUserIdService(clientId);
      if (wallet.balance < pricing.amount) throw new Error('Insufficient balance');

      // Déduire le montant du wallet
      await WalletService.removeBalanceService(clientId, pricing.amount);

      // Créer l'abonnement
      const subscription = new Subscription({
        clientId: mongoose.Types.ObjectId(clientId),
        agencyId: mongoose.Types.ObjectId(agencyId),
        pricingId: mongoose.Types.ObjectId(pricingId),
        startDate: new Date(),
        endDate,
        amount: pricing.amount,
        isActive: true
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
      return await Subscription.find({ clientId: mongoose.Types.ObjectId(clientId) })
        .populate('agencyId', 'name')
        .populate('pricingId', 'name amount');
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
        .populate('pricingId', 'name amount');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Annuler un abonnement
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
