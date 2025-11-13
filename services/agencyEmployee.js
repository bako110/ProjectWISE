const Agence = require('../models/agency');
const User = require('../models/User');

class AgencyEmployeeService {

    /**
     * Récupère tous les employés d'une agence (collectors et gestionnaires)
     * @param {String} agencyId - ID de l'agence
     * @returns {Array} Liste des employés
     */
    async getEmployees(agencyId) {
        try {
            if (!agencyId || !agencyId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('ID d’agence invalide');
            }

            const agency = await Agence.findById(agencyId)
                .populate('collector', 'firstName lastName email phone role')
                .populate('gestionnaires', 'firstName lastName email phone role');

            if (!agency) throw new Error('Agence introuvable');

            const employees = [];

            // Ajouter le collector (si c'est un objet ou tableau)
            if (agency.collector) {
                if (Array.isArray(agency.collector)) {
                    employees.push(...agency.collector);
                } else {
                    employees.push(agency.collector);
                }
            }

            // Ajouter les gestionnaires
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
     * Récupérer uniquement les collectors actifs d'une agence
     * @param {String} agencyId 
     * @returns {Array} Liste des collectors
     */
    async getCollectorsByAgency(agencyId) {
        try {
            if (!agencyId || !agencyId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('ID d’agence invalide');
            }

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
