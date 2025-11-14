const User = require('../models/User');

class AgencyEmployeeService {
  /**
   * 🔹 Récupérer tous les employés d'une agence (managers, gestionnaires, collecteurs)
   * @param {String} agencyId
   */
  async getAgencyEmployees(agencyId) {
    if (!agencyId) throw new Error("L'identifiant de l'agence est requis");

    // Cherche tous les utilisateurs actifs qui sont des employés (manager, gestionnaire, collector)
    const users = await User.find({
      agencyId: agencyId,
      status: 'active',
      role: { $in: ['manager', 'gestionnaire', 'collector'] }
    }).select('firstName lastName email phone role');

    // Grouper par rôle
    const managers = users.filter(u => u.role === 'manager');
    const gestionnaires = users.filter(u => u.role === 'gestionnaire');
    const collectors = users.filter(u => u.role === 'collector');

    return { managers, gestionnaires, collectors };
  }

  /**
   * 🔹 Récupérer uniquement les collecteurs actifs d'une agence
   * @param {String} agencyId
   */
  async getCollectorsByAgency(agencyId) {
    if (!agencyId) throw new Error("L'identifiant de l'agence est requis");

    const collectors = await User.find({
      agencyId: agencyId,
      role: 'collector',
      status: 'active'
    }).select('firstName lastName email phone');

    return collectors;
  }
}

module.exports = new AgencyEmployeeService();
