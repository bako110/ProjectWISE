const AgencyEmployeeService = require('../services/agencyEmployee');

class AgencyEmployeeController {

    /**
     * Récupérer la liste des employés d'une agence
     * @param {Object} req - requête Express
     * @param {Object} res - réponse Express
     */
    async getEmployees(req, res) {
        try {
            const { agencyId } = req.params;

            if (!agencyId) {
                return res.status(400).json({
                    success: false,
                    message: "ID de l'agence requis"
                });
            }

            const employees = await AgencyEmployeeService.getEmployees(agencyId);

            return res.status(200).json({
                success: true,
                message: "Liste des employés récupérée avec succès",
                data: employees
            });

        } catch (error) {
            console.error('❌ Erreur récupération employés:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Récupérer la liste des collecteurs d'une agence
     * @param {Object} req - requête Express
     * @param {Object} res - réponse Express
     */
    async getCollectorsByAgency(req, res) {
        try {
            const { agencyId } = req.params;

            if (!agencyId) {
                return res.status(400).json({
                    success: false,
                    message: "ID de l'agence requis"
                });
            }

            // Utilisation de AgencyEmployeeService pour récupérer les collecteurs
            const collectors = await AgencyEmployeeService.getCollectorsByAgency(agencyId);

            return res.status(200).json({
                success: true,
                message: `Collectors de l'agence ${agencyId} récupérés avec succès`,
                data: collectors
            });

        } catch (error) {
            console.error("❌ Erreur récupération collectors :", error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des collectors",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new AgencyEmployeeController();
