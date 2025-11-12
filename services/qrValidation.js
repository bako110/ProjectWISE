const Collecte = require('../models/Collecte');
const logger = require('../utils/logger');

class CollecteService {
  /**
   * Met à jour le statut d'une collecte spécifique
   * @param {String} collectId - ID de la collecte
   * @param {String} status - Nouveau statut
   */
  static async updateCollecteStatus({ collectId, status }) {
    try {
      const collecte = await Collecte.findById(collectId);
      if (!collecte) throw new Error('Collecte not found');

      collecte.status = status;
      await collecte.save();

      logger.info(`Collecte ${collecte._id} status updated to ${status}`);
      return collecte;
    } catch (error) {
      logger.error(error);
      throw new Error(error.message);
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
