const AgencyEmployeeService = require('../services/agencyEmployeeService');

class AgencyEmployeeController {
  /**
   * Récupérer les employés, gestionnaires et manager d'une agence
   */
  static async getEmployees(req, res) {
    try {
      const { agencyId } = req.params;
      const employeesData = await AgencyEmployeeService.getAgencyEmployees(agencyId);

      res.status(200).json({
        success: true,
        message: 'Liste des employés récupérée avec succès',
        data: employeesData
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Récupérer uniquement les collecteurs actifs d'une agence
   */
  static async getCollectorsByAgency(req, res) {
    try {
      const { agencyId } = req.params;

      if (!agencyId) {
        return res.status(400).json({
          success: false,
          message: "ID de l'agence requis"
        });
      }

      const collectors = await AgencyEmployeeService.getCollectorsByAgency(agencyId);

      return res.status(200).json({
        success: true,
        message: `Collecteurs de l'agence ${agencyId} récupérés avec succès`,
        data: collectors
      });

    } catch (error) {
      console.error('❌ Erreur récupération collecteurs:', error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des collecteurs",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AgencyEmployeeController;
