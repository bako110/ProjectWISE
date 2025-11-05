const Agence = require('../models/agency');

class AgencyEmployeeService {

    /**
     * Récupère la liste des employés d'une agence
     * @param {String} agencyId - ID de l'agence
     * @returns {Object} Liste des employés
     */
    async getEmployees(agencyId) {
        try {
            // Vérifier que l'agence existe et peupler les relations
            const agency = await Agence.findById(agencyId)
                .populate('owner', 'firstName lastName email phone role')
                .populate('collector', 'firstName lastName email phone role')
                .populate('gestionnaires', 'firstName lastName email phone role');

            if (!agency) {
                throw new Error('Agence non trouvée');
            }

            // Construire la liste des employés
            const employees = [];
            if (agency.owner) employees.push(agency.owner);
            if (agency.collector) employees.push(agency.collector);
            if (agency.gestionnaires && agency.gestionnaires.length > 0) {
                employees.push(...agency.gestionnaires);
            }

            return {
                success: true,
                message: `Liste des employés pour l'agence ${agency.name}`,
                data: employees
            };

        } catch (error) {
            console.error('❌ Erreur récupération employés agence:', error);
            throw new Error(`Erreur lors de la récupération : ${error.message}`);
        }
    }
}

module.exports = new AgencyEmployeeService();
