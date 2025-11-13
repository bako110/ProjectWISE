const Agence = require('../models/Agence');
const User = require('../models/User');

class AgencyEmployeeService {

  /**
   * Récupérer tous les employés, gestionnaires et manager d'une agence
   */
  static async getAgencyEmployees(agencyId) {
    const agency = await Agence.findById(agencyId)
      .populate('gestionnaires', 'firstName lastName email role status')
      .populate('owner', 'firstName lastName email role status')
      .populate('collector', 'firstName lastName email role status')
      .populate('client', 'firstName lastName email role status');

    if (!agency) {
      throw new Error('Agence non trouvée');
    }

    return {
      id: agency._id,
      name: agency.name,
      owner: agency.owner,
      gestionnaires: agency.gestionnaires,
      collectors: agency.collector,
      clients: agency.client
    };
  }

  /**
   * Récupérer uniquement les collecteurs actifs d'une agence
   */
  static async getCollectorsByAgency(agencyId) {
    const agency = await Agence.findById(agencyId).populate('collector', 'firstName lastName email role status');
    
    if (!agency) {
      throw new Error('Agence non trouvée');
    }

    // On filtre uniquement les collecteurs actifs
    const collectors = Array.isArray(agency.collector)
      ? agency.collector.filter(c => c.status === 'active')
      : agency.collector && agency.collector.status === 'active'
        ? [agency.collector]
        : [];

    return collectors;
  }
}

module.exports = AgencyEmployeeService;
