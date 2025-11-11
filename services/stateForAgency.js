const User = require('../models/User');
const Agency = require('../models/agency');

class AgencyStatsService {
  /**
   * Récupère les statistiques d'une agence
   * @param {String} agencyId - ID de l'agence
   * @returns {Object} Statistiques de l'agence
   */
  static async getAgencyStats(agencyId) {
    try {
      // Vérifier si l'agence existe
      const agency = await Agency.findById(agencyId);
      if (!agency) {
        throw new Error('Agence introuvable');
      }

      // Compter les clients actifs liés à cette agence
      const activeClientsCount = await User.countDocuments({
        agencyId,
        role: 'client',
        status: 'active',
      });

      // Compter les collecteurs
      const collectorsCount = await User.countDocuments({
        agencyId,
        role: 'collector',
        status: { $ne: 'deleted' }, // tous sauf supprimés
      });

      // Compter les gestionnaires
      const managersCount = await User.countDocuments({
        agencyId,
        role: 'manager',
        status: { $ne: 'deleted' },
      });

      // Statut général de l’agence
      const agencyStatus = agency.status;

      // Retour des stats
      return {
        agencyId,
        agencyName: agency.name,
        status: agencyStatus,
        totalClientsActifs: activeClientsCount,
        totalCollecteurs: collectorsCount,
        totalGestionnaires: managersCount,
      };

    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = AgencyStatsService;
