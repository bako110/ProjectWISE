const AgencyClientService = require('../services/agencyClient');

class AgencyClientController {

  /**
   * 🔹 Récupérer les clients abonnés à une agence
   */
  static async getSubscribedClients(req, res) {
    try {
      const { agencyId } = req.params;

      if (!agencyId) {
        return res.status(400).json({
          success: false,
          message: "L'identifiant de l'agence est requis"
        });
      }

      const clients = await AgencyClientService.getSubscribedClients(agencyId);

      return res.status(200).json({
        success: true,
        message: "Clients abonnés récupérés avec succès",
        data: clients
      });

    } catch (error) {
      console.error("❌ Erreur récupération clients abonnés :", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AgencyClientController;
