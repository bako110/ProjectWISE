const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');

class AgencyEmployeeService {
  /**
   * 🔹 Récupérer tous les employés d'une agence (managers, gestionnaires, collecteurs)
   * @param {String} agencyId
   */
  async getAgencyEmployees(agencyId, filters = {}) {
    if (!agencyId) throw new Error("L'identifiant de l'agence est requis");

     const query = {
      agencyId,
      role: { $in: ['manager', 'gestionnaire', 'collector'] },
      status: 'active'
    };

    // 🔍 Filtre de recherche textuelle
    if (filters.term) {
      query.$or = [
        { firstName: { $regex: filters.term, $options: 'i' } },
        { lastName: { $regex: filters.term, $options: 'i' } },
        { email: { $regex: filters.term, $options: 'i' } },
        { phone: { $regex: filters.term, $options: 'i' } }
      ];
    }

    // 🔍 Autres filtres éventuels (exemple : ville, type, etc.)
    if (filters.city ) {
      query["address.city"] = filters.city;
    }

    if (filters.neighborhood) {
      query["address.neighborhood"] = filters.neighborhood;
    }

    if (filters.arrondissement) {
      query["address.arrondissement"] = filters.arrondissement;
    }
    if (filters.sector) {
      query["address.sector"] = filters.sector;
    }

    if (filters.role) {
      query.role = filters.role;
    }

    const users = await User.find(query).select('_id firstName lastName email phone role agencyId isOwnerAgency');
    

    // Grouper par rôle
    const managers = users.filter(u => u.role === 'manager');
    const collectors = users.filter(u => u.role === 'collector');

    return { managers, collectors };
  }

  /**
   * 🔹 Récupérer uniquement les collecteurs actifs d'une agence
   * @param {String} agencyId
   */
  async getCollectorsByAgency(agencyId, filters = {}) {
    if (!agencyId) throw new Error("L'identifiant de l'agence est requis");

      const query = {
      agencyId,
      role: 'collector',
      status: 'active'
    };

    // 🔍 Filtre de recherche textuelle
    if (filters.term) {
      query.$or = [
        { firstName: { $regex: filters.term, $options: 'i' } },
        { lastName: { $regex: filters.term, $options: 'i' } },
        { email: { $regex: filters.term, $options: 'i' } },
        { phone: { $regex: filters.term, $options: 'i' } }
      ];
    }

    // 🔍 Autres filtres éventuels (exemple : ville, type, etc.)
    if (filters.city ) {
      query["address.city"] = filters.city;
    }

    if (filters.neighborhood) {
      query["address.neighborhood"] = filters.neighborhood;
    }
    
     const collectors = await User.find(query)
      .limit(filters.limit)
      .skip((filters.page - 1) * filters.limit)
      .select('_id firstName lastName email phone address role agencyId isOwnerAgency')
      .sort({ createdAt: -1 });

    return collectors;
  }


  async getClientsByAgency(agencyId, filters = {}) {
    if (!agencyId) throw new Error("L'identifiant de l'agence est requis");

    logger.info( filters);
    const query = {
      agencyId,
      role: 'client',
      status: 'active'
    };

    // 🔍 Filtre de recherche textuelle
    if (filters.term) {
      query.$or = [
        { firstName: { $regex: filters.term, $options: 'i' } },
        { lastName: { $regex: filters.term, $options: 'i' } },
        { email: { $regex: filters.term, $options: 'i' } },
        { phone: { $regex: filters.term, $options: 'i' } }
      ];
    }

    // 🔍 Autres filtres éventuels (exemple : ville, type, etc.)
    if (filters.city ) {
      query["address.city"] = filters.city;
    }

    if (filters.neighborhood) {
      query["address.neighborhood"] = filters.neighborhood;
    }



    const clients = await User.find(query)
      .limit(filters.limit)
      .skip((filters.page - 1) * filters.limit)
      .select('_id firstName lastName email phone address role agencyId isOwnerAgency')
      .sort({ createdAt: -1 });

    return clients;
  }

}

module.exports = new AgencyEmployeeService();
