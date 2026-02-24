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
  // Définir le début et la fin de la journée
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Récupérer les collectes d'aujourd'hui
  const collectes = await Collecte.find({
    agencyId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['Scheduled', 'Collected'] }
  })
    .populate('clientId', 'lastName firstName email')
    .populate('collectorId', 'lastName firstName email')
    .sort({ date: 1 }); // Trier par date

  // Calculer les statistiques par status
  const stats = collectes.reduce((acc, collecte) => {
    const status = collecte.status;
    if (!acc[status]) {
      acc[status] = {
        count: 0,
        collectes: []
      };
    }
    acc[status].count++;
    acc[status].collectes.push(collecte);
    return acc;
  }, {});

  // Ajouter un résumé global
  const summary = {
    total: collectes.length,
    scheduled: stats['Scheduled']?.count || 0,
    collected: stats['Collected']?.count || 0
  };

  return {
    collectes,
    // stats,
    summary,
    date: startOfDay
  };
}


  static async getCollectesByCollector(collectorId) {
    return await Collecte.find({ collectorId })
      .populate('clientId', 'lastName firstName email address phone qrCode')
      .populate('agencyId', 'name');
  }


  static async getAllCollectes(query = {}) {
    const {
      date,
      status,
      agencyId,
      limit = 25,
      skip = 0,
      term
    } = query;

    const filter = {};

    // 📅 Filtre par date
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    // 📌 Filtre par statut
    if (status) {
      filter.status = status;
    }

    // 🏢 Filtre par agence
    if (agencyId && mongoose.Types.ObjectId.isValid(agencyId)) {
      filter.agencyId = new mongoose.Types.ObjectId(agencyId);
    }

    // 🔍 Recherche texte
    if (term) {
      filter.$or = [
        { status: { $regex: term, $options: "i" } }
      ];
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedSkip = parseInt(skip, 10);

    const [collectes, total] = await Promise.all([
      Collecte.find(filter)
        .populate("clientId", "lastName firstName email qrCode")
        .populate("collectorId", "lastName firstName email")
        .populate("agencyId", "name")
        .sort({ date: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit),
      Collecte.countDocuments(filter),
    ]);

    return {
      total,
      limit: parsedLimit,
      skip: parsedSkip,
      collectes,
    };
  }

}

module.exports = CollecteService;
