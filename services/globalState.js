const User = require('../models/User');
const Agency = require('../models/agency');

const getDashboardStats = async () => {
  const totalMunicipalityAgents = await User.countDocuments({ role: 'municipality' });
  const totalManagers = await User.countDocuments({ role: 'manager' });
  const totalCollectors = await User.countDocuments({ role: 'collector' });
  const totalClients = await User.countDocuments({ role: 'client' });
  const totalAgencies = await Agency.countDocuments();

  // 🔹 Calcul des adhésions du mois courant
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyClientSubscriptions = await User.countDocuments({
    role: 'client',
    createdAt: { $gte: firstDay, $lte: lastDay }
  });

  return {
    totalMunicipalityAgents,
    totalManagers,
    totalCollectors,
    totalClients,
    totalAgencies,
    monthlyClientSubscriptions,
  };
};

module.exports = { getDashboardStats };
