const Subscription = require('../models/subscription.js');
const PricingService = require('../services/pricingAgency.js');
const WalletService = require('../services/wallet.js');
const logger = require('../utils/logger.js');
const mongoose = require('mongoose');

class SubscriptionService {

  /**
   * Créer un abonnement
   * @param {Object} param0
   * @param {string} param0.clientId - ID du client
   * @param {string} param0.pricingId - ID du plan tarifaire
   * @param {Date} param0.endDate - Date de fin de l'abonnement
   */


  //il faudra revenir voir pour utilisateurs qui ferons plusieurs fois pour que le temps soit bien defini après son deuxieme abonnement
  static async createSubscription({ clientId, pricingId, month }) {
    try {
      month = parseInt(month);
      logger.info(`Création de l'abonnement pour le client ${clientId} et le plan tarifaire ${pricingId} et le nombre de mmoi ${month}`);
      let startDate = new Date();
      let endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + month));
      if (!clientId) throw new Error('Client not found');
      if (!pricingId) throw new Error('Pricing plan not found');

      // Récupérer le pricing
      const pricing = await PricingService.getPricingById(pricingId);
      if (!pricing) throw new Error('Pricing plan not found');
      const amountSubscription = pricing.price * month;

      // Récupérer l'agence associée
      const agencyId = pricing.agencyId;
      if (!agencyId) throw new Error('Agency not found');

      // Vérifier le wallet du client
      const clientWallet = await WalletService.getWalletByUserIdService(clientId);
      logger.info(clientWallet._doc.balance);
      const userBalance = clientWallet._doc.balance;
      if (userBalance < amountSubscription) throw new Error('Insufficient balance');

      // Déduire le montant du wallet du client
      await WalletService.removeBalanceService(clientId, amountSubscription);

      // Ajouter le montant dans le wallet de l'agence
      await WalletService.addBalanceService(agencyId, amountSubscription);

      const existingSubscription = await Subscription.findOne({ clientId, isActive: true });
      if (existingSubscription) {
        startDate = existingSubscription.endDate;
        endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + month));
      };

      // Créer l'abonnement
      const subscription = new Subscription({
        clientId,
        agencyId,
        pricingId,
        startDate,
        endDate,
        numberMonths: month,
        amount: amountSubscription,
        isActive: true
      });

      await subscription.save();
      return subscription;

    } catch (error) {
      logger.error(error);
      throw new Error(error.message);
    }
  }

  // Récupérer tous les abonnements d'un client
  static async getSubscriptionsByClient(clientId) {
    try {
      return await Subscription.find({clientId})
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
