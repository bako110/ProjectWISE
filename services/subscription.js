const Subscription = require('../models/subscription.js');
const PricingService = require('../services/pricingAgency.js'); // récupérer les plans
const AgencyService = require('../services/agency.js');   // récupérer agences
const WalletService = require('../services/wallet.js');   // gérer solde via wallet
const mongoose = require('mongoose');

class SubscriptionService {
  
  // Créer un abonnement avec validation du solde via wallet
  static async createSubscription({ clientId, agencyId, pricingId, startDate, endDate }) {
    try {
      // 1️⃣ Vérifier le plan tarifaire
      const pricing = await PricingService.getPricingById(pricingId);
      if (!pricing) throw new Error('Pricing plan not found');

      // 2️⃣ Vérifier l'agence
      const agency = await AgencyService.getAgencyById(agencyId);
      if (!agency) throw new Error('Agency not found');

      // 3️⃣ Récupérer le wallet du client
      const wallet = await WalletService.getWalletByUserIdService(clientId);

      // 4️⃣ Vérifier le solde
      if (wallet.balance < pricing.amount) {
        throw new Error('Insufficient balance');
      }

      // 5️⃣ Déduire le montant du wallet
      await WalletService.removeBalanceService(clientId, pricing.amount);

      // 6️⃣ Créer l'abonnement
      const subscription = new Subscription({
        clientId: mongoose.Types.ObjectId(clientId),
        agencyId: mongoose.Types.ObjectId(agencyId),
        pricingId: mongoose.Types.ObjectId(pricingId),
        startDate: startDate || new Date(),
        endDate,
        amount: pricing.amount, // stocker le montant payé
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
