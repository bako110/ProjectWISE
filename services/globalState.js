const User = require('../models/User');
const Agency = require('../models/agency'); // assure-toi que le fichier s'appelle bien agency.js

const getDashboardStats = async () => {
  // Comptage des utilisateurs par rôle
  const totalMunicipalityAgents = await User.countDocuments({ role: 'municipality' });
  const totalManagers = await User.countDocuments({ role: 'manager' });
  const totalCollectors = await User.countDocuments({ role: 'collector' });
  const totalClients = await User.countDocuments({ role: 'client' });

  // Comptage des agences (utilise le champ `status` du schéma)
  const totalAgencies = await Agency.countDocuments(); // toutes les agences, y compris 'deleted' si présentes
  const totalActiveAgencies = await Agency.countDocuments({ status: 'active' });
  const totalInactiveAgencies = await Agency.countDocuments({ status: 'inactive' });
  const totalDeletedAgencies = await Agency.countDocuments({ status: 'deleted' }); // optionnel

  // Clients inscrits ce mois-ci
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyClientSubscriptions = await User.countDocuments({
    role: 'client',
    createdAt: { $gte: firstDay, $lte: lastDay }
  });

  // Pourcentage d'adhésions du mois
  const monthlyClientPercentage =
    totalClients > 0 ? ((monthlyClientSubscriptions / totalClients) * 100).toFixed(2) : 0;

  return {
    totalMunicipalityAgents,
    totalManagers,
    totalCollectors,
    totalClients,
    totalAgencies,
    totalActiveAgencies,
    totalInactiveAgencies,
    totalDeletedAgencies,        // ajouté mais optionnel selon besoin
    monthlyClientSubscriptions,
    monthlyClientPercentage: Number(monthlyClientPercentage),
  };
};

module.exports = { getDashboardStats };
