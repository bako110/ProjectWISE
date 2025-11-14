const AgencyEmployeeService = require('../services/agencyEmployee');

class AgencyEmployeeController {
  /**
   * 🔹 Récupérer tous les employés (managers, gestionnaires, collecteurs) d'une agence
   */
  static async getEmployees(req, res) {
    try {
      const { agencyId } = req.params;

      if (!agencyId) {
        return res.status(400).json({
          success: false,
          message: "L'identifiant de l'agence est requis",
        });
      }

      const employees = await AgencyEmployeeService.getAgencyEmployees(agencyId);

      return res.status(200).json({
        success: true,
        message: 'Liste des employés récupérée avec succès',
        data: employees
      });
    } catch (error) {
      console.error('❌ Erreur récupération employés:', error.message || error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur serveur'
      });
    }
  }

  /**
   * 🔹 Récupérer uniquement les collecteurs actifs d'une agence
   */
  static async getCollectorsByAgency(req, res) {
    try {
      const { agencyId } = req.params;

      if (!agencyId) {
        return res.status(400).json({
          success: false,
          message: "L'identifiant de l'agence est requis"
        });
      }

      const collectors = await AgencyEmployeeService.getCollectorsByAgency(agencyId);

      return res.status(200).json({
        success: true,
        message: `Collecteurs de l'agence ${agencyId} récupérés avec succès`,
        data: collectors
      });

    } catch (error) {
      console.error('❌ Erreur récupération collecteurs:', error.message || error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des collecteurs",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

    static async getClientsByAgency(req, res) {
    try {
      const { agencyId } = req.params;

      if (!agencyId) {
        return res.status(400).json({
          success: false,
          message: "L'identifiant de l'agence est requis"
        });
      }

      const clients = await AgencyEmployeeService.getClientsByAgency(agencyId);

      return res.status(200).json({
        success: true,
        message: `Clients de l'agence ${agencyId} récupérés avec succès`,
        data: clients
      });

    } catch (error) {
      console.error('❌ Erreur récupération clients:', error.message || error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des clients",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AgencyEmployeeController;
