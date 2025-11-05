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

            // Vérification de l'ID de l'agence
            if (!agencyId) {
                return res.status(400).json({
                    success: false,
                    message: "ID de l'agence requis"
                });
            }

            // Appel du service pour récupérer les employés
            const employees = await AgencyEmployeeService.getEmployees(agencyId);

            // Réponse
            res.status(200).json({
                success: true,
                message: "Liste des employés récupérée avec succès",
                data: employees
            });

        } catch (error) {
            console.error('❌ Erreur récupération employés:', error);
            res.status(500).json({
                success: false,
                message: "Erreur serveur",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new AgencyEmployeeController();
