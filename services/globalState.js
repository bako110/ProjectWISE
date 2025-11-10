const User = require('../models/User');
const Agency = require('../models/agency');

const getDashboardStats = async () => {
  const totalMunicipalityAgents = await User.countDocuments({ role: 'municipality' });
  const totalManagers = await User.countDocuments({ role: 'manager' });
  const totalCollectors = await User.countDocuments({ role: 'collector' });
  const totalClients = await User.countDocuments({ role: 'client' });

  // Comptage des agences
  const totalAgencies = await Agency.countDocuments(); // toutes
  const totalActiveAgencies = await Agency.countDocuments({ isActive: true });
  const totalInactiveAgencies = await Agency.countDocuments({ isActive: false });

  // Clients inscrits ce mois-ci
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyClientSubscriptions = await User.countDocuments({
    role: 'client',
    createdAt: { $gte: firstDay, $lte: lastDay }
  });

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
    monthlyClientSubscriptions,
    monthlyClientPercentage: Number(monthlyClientPercentage),
  };
};

module.exports = { getDashboardStats };
