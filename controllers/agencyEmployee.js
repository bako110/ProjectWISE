const AgencyEmployeeService = require('../services/agencyEmployee');
const logger = require('../utils/logger');

class AgencyEmployeeController {
  /**
   * 🔹 Récupérer tous les employés (managers, gestionnaires, collecteurs) d'une agence
   */
  static async getEmployees(req, res) {
    try {
      const { agencyId } = req.params;
      
      const { neighborhood, city, role, arrondissement, sector } = req.query;
      const { term, limit, page } = req.query;
      const filters = {};

      logger.info('Query parameters received in controller:', req.query);
      if (neighborhood) filters.neighborhood = neighborhood;
      if (city) filters.city = city;
      if (role) filters.role = role;
      if (arrondissement) filters.arrondissement = arrondissement;
      if (sector) filters.sector = sector;
      if (term) filters.term = term;
      if (limit) filters.limit = parseInt(limit, 10);
      if (page) filters.page = parseInt(page, 10);
      logger.info('Filters received in controller:', filters);

      if (!agencyId) {
        return res.status(400).json({
          success: false,
          message: "L'identifiant de l'agence est requis",
        });
      }

      const employees = await AgencyEmployeeService.getAgencyEmployees(agencyId, filters);

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

      const { neighborhood, city } = req.query;
      const { term, limit, page } = req.query;
      const filters = {};

      logger.info('Query parameters received in controller:', req.query);
      if (neighborhood) filters.neighborhood = neighborhood;
      if (city) filters.city = city;
      if (term) filters.term = term;
      if (limit) filters.limit = parseInt(limit, 10);
      if (page) filters.page = parseInt(page, 10);
      logger.info('Filters received in controller:', filters);

      if (!agencyId) {
        return res.status(400).json({
          success: false,
          message: "L'identifiant de l'agence est requis"
        });
      }

      const collectors = await AgencyEmployeeService.getCollectorsByAgency(agencyId, filters);

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
      const { neighborhood, city } = req.query;
      const { term, limit, page } = req.query;
      const filters = {};

      logger.info('Query parameters received in controller:', req.query);
      if (neighborhood) filters.neighborhood = neighborhood;
      if (city) filters.city = city;
      if (term) filters.term = term;
      if (limit) filters.limit = parseInt(limit, 10);
      if (page) filters.page = parseInt(page, 10);
      logger.info('Filters received in controller:', filters);
      if (!agencyId) {
        return res.status(400).json({
          success: false,
          message: "L'identifiant de l'agence est requis"
        });
      }

      const clients = await AgencyEmployeeService.getClientsByAgency(agencyId, filters);

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
