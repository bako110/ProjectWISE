const Collecte = require('../models/Collecte');
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');

class CollecteService {
  /**
   * Met à jour le statut d'une collecte spécifique
   * @param {String} collectId - ID de la collecte
   * @param {String} status - Nouveau statut
   */
  static async updateCollecteStatus({ code, id, name }) {
  try {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    logger.info(`Updating collecte status for user ID: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid user ID');
    }

    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    if (`${user.firstName} ${user.lastName}` !== name) {
      throw new Error('Name does not match user record');
    }

    if (user.address.neighborhood !== code) {
      throw new Error('Code does not match user record');
    }

    const collecte = await Collecte.findOne({
      clientId: id,
      status: 'Scheduled',
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!collecte) {
      logger.info(`No scheduled collecte found for user ID: ${id} today`);
      return false; // 👈 important
    }

    collecte.status = 'Collected';
    await collecte.save();

    logger.info(`Collecte ${collecte._id} status updated to Collected`);
    return true;

  } catch (error) {
    logger.error(error);
    throw error;
  }
}


  static async getCollectesByAgency(agencyId) {
    return await Collecte.find({ agencyId })
      .populate('clientId', 'lastName email qrCode')
      .populate('collectorId', 'lastName email');
  }

  static async getCollectesByCollector(collectorId) {
    return await Collecte.find({ collectorId })
      .populate('clientId', 'lastName email qrCode')
      .populate('agencyId', 'name');
  }

  static async getAllCollectes() {
    return await Collecte.find()
      .populate('clientId', 'lastName email qrCode')
      .populate('collectorId', 'lastName email')
      .populate('agencyId', 'name');
  }
}

module.exports = CollecteService;
