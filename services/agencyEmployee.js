const Agence = require('../models/agency');
const User = require('../models/User');

class AgencyEmployeeService {

    /**
     * Récupère la liste des employés d'une agence
     * @param {String} agencyId - ID de l'agence
     * @returns {Object} Liste des employés
     */
    async getEmployees(agencyId) {
        try {
            const agency = await Agence.findById(agencyId)
                .populate('owner', 'firstName lastName email phone role')
                .populate('collector', 'firstName lastName email phone role')
                .populate('gestionnaires', 'firstName lastName email phone role');

            if (!agency) {
                throw new Error('Agence non trouvée');
            }

            const employees = [];
            if (agency.owner) employees.push(agency.owner);
            if (agency.collector) employees.push(agency.collector);
            if (agency.gestionnaires && agency.gestionnaires.length > 0) {
                employees.push(...agency.gestionnaires);
            }

            return employees;

        } catch (error) {
            console.error('❌ Erreur récupération employés agence:', error);
            throw new Error(`Erreur lors de la récupération : ${error.message}`);
        }
    }

    /**
     * Récupère tous les collectors d'une agence
     * @param {String} agencyId - ID de l'agence
     * @returns {Array} Liste des collectors
     */
    async getCollectorsByAgency(agencyId) {
        try {
            const agency = await Agence.findById(agencyId);
            if (!agency) throw new Error('Agence introuvable');

            const collectors = await User.find({
                role: 'collector',
                agencyId: agencyId,
                status: 'active'
            }).select('firstName lastName email phone');

            return collectors;
        } catch (error) {
            console.error('❌ Erreur récupération collectors:', error);
            throw new Error(`Erreur lors de la récupération : ${error.message}`);
        }
    }
}

module.exports = new AgencyEmployeeService();
