const AgencyStatsService = require('../services/stateForAgency');

class AgencyStatsController {
  /**
   * Obtenir les statistiques d'une agence
   */
  static async getStats(req, res) {
    try {
      const { agencyId } = req.params;

      const stats = await AgencyStatsService.getAgencyStats(agencyId);

      return res.status(200).json({
        success: true,
        message: "Statistiques récupérées avec succès",
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Erreur lors de la récupération des statistiques",
      });
    }
  }
}

module.exports = AgencyStatsController;