const Subscription = require('../models/subscription.js');
const PricingService = require('../services/pricingAgency.js');
const WalletService = require('../services/wallet.js');
const Passage = require('../models/Passage.js');
const User = require('../models/User.js');
const logger = require('../utils/logger.js');
const Agency = require('../models/agency.js');
const QRCode = require('qrcode');
const mongoose = require('mongoose');

class SubscriptionService {

  /**
   * Créer un abonnement avec génération automatique du QR Code
   * @param {Object} param0
   * @param {string} param0.clientId
   * @param {string} param0.pricingId
   * @param {number} param0.month
   */
  static async createSubscription({ clientId, pricingId, month }) {
    try {
      month = parseInt(month);
      logger.info(`Création de l'abonnement pour le client ${clientId}, plan ${pricingId}, durée ${month} mois`);

      if (!clientId) throw new Error('Client not found');
      if (!pricingId) throw new Error('Pricing plan not found');

      // Récupérer le pricing
      const pricing = await PricingService.getPricingById(pricingId);
      if (!pricing) throw new Error('Pricing plan not found');

      const amountSubscription = pricing.price * month;
      const agencyId = pricing.agencyId;
      if (!agencyId) throw new Error('Agency not found');

      // Vérifier le solde du client
      const clientWallet = await WalletService.getWalletByUserIdService(clientId);
      if (clientWallet._doc.balance < amountSubscription) throw new Error('Insufficient balance');

      // Transfert d'argent
      await WalletService.removeBalanceService(clientId, amountSubscription);
      await WalletService.addBalanceService(agencyId, amountSubscription);

      // Vérifier s'il y a un abonnement actif
      const existingSubscription = await Subscription.findOne({ clientId, isActive: true });
      let startDate = new Date();
      if (existingSubscription) {
        startDate = existingSubscription.endDate;
      }
      const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + month));

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

      const passage = new Passage({
        clientId,
        agencyId,
        dayNumber: pricing.numberOfPasses
      });

      await subscription.save();
      await passage.save();

      // 🔹 Génération du QR Code (avec agencyId correct et infos supplémentaires)
      const qrData = JSON.stringify({
        subscriptionId: subscription._id,
        clientId,
        agencyId,         // ✅ ID correct de l'agence
        pricingId,        // plan utilisé
        endDate           // pour vérifier la validité
      });

      const qrCodeUrl = await QRCode.toDataURL(qrData);

      // 🔹 Stocker ou écraser le QR Code dans l'utilisateur
      const user = await User.findById(clientId);
      if (user) {
        user.qrCode = qrCodeUrl; // écrase l'ancien QR Code si existant
        await user.save();
      }

      logger.info('Subscription created successfully with QR Code');
      return subscription;

    } catch (error) {
      logger.error(error);
      throw new Error(error.message);
    }
  }

  // Récupérer tous les abonnements d'un client
  static async getSubscriptionsByClient(clientId) {
    try {
      return await Subscription.find({ clientId })
        .populate('agencyId', 'name')
        .populate('pricingId', 'price numberOfPasses planType');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Récupérer tous les abonnements
  static async getAllSubscriptions() {
    try {
      return await Subscription.find()
        .populate('clientId', 'lastName email qrCode')
        .populate('pricingId', 'price numberOfPasses planType')
        .populate('agencyId', 'name');
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

      // 🔹 Supprimer QR Code si c'était le dernier abonnement actif
      const user = await User.findById(subscription.clientId);
      if (user) {
        const activeSub = await Subscription.findOne({ clientId: user._id, isActive: true });
        if (!activeSub) {
          user.qrCode = null;
          await user.save();
        }
      }

      return subscription;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = SubscriptionService;
