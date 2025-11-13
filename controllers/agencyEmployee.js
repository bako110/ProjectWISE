const {agencyEmployeeService} = require('../services/agencyEmployee');
const logger = require('../utils/logger');
exports.AgencyEmployeeController = {

    /**
     * Récupérer tous les employés d'une agence
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
            logger.info(`Récupération des employés pour l'agence ${agencyId}`);
            const employees = await agencyEmployeeService.getEmploye(agencyId);

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
    },

    /**
     * Récupérer uniquement les collectors actifs d'une agence
     */
    // async getCollectorsByAgency(req, res) {
    //     try {
    //         const { agencyId } = req.params;

    //         if (!agencyId) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: "ID de l'agence requis"
    //             });
    //         }

    //         const collectors = await AgencyEmployeeService.getCollectorsByAgency(agencyId);

    //         return res.status(200).json({
    //             success: true,
    //             message: `Collectors de l'agence ${agencyId} récupérés avec succès`,
    //             data: collectors
    //         });

    //     } catch (error) {
    //         console.error('❌ Erreur récupération collectors:', error);
    //         return res.status(500).json({
    //             success: false,
    //             message: "Erreur lors de la récupération des collectors",
    //             error: process.env.NODE_ENV === 'development' ? error.message : undefined
    //         });
    //     }
    // }
}

// module.exports = new AgencyEmployeeController();
