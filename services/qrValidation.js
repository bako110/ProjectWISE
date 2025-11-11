const Collecte = require('../models/Collecte');
const logger = require('../utils/logger');

class CollecteService {

  static async markCollected({ code, collectorId }) {
    try {
      const collecte = await Collecte.findOne({ code });
      if (!collecte) throw new Error('Collecte not found');

      // Vérifier si la collecte a déjà été marquée
      if (collecte.status === 'collected') {
        throw new Error('Collecte already collected');
      }

      collecte.status = 'collected';
      collecte.collectorId = collectorId;
      collecte.nbCollecte = (collecte.nbCollecte || 0) + 1;
      collecte.date = new Date();

      await collecte.save();
      logger.info(`Collecte ${collecte._id} marquée comme collected par ${collectorId}`);
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
