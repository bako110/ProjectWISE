const User = require('../models/User');
const Agency = require('../models/agency'); // Vérifie si ton fichier s’appelle bien agency.js ou agence.js
const Collecte = require('../models/Collecte'); // Ton modèle de collecte

const getDashboardStats = async () => {
  // --- 🔹 Statistiques sur les utilisateurs ---
  const totalMunicipalityAgents = await User.countDocuments({ role: 'municipality' });
  const totalManagers = await User.countDocuments({ role: 'manager' });
  const totalCollectors = await User.countDocuments({ role: 'collector' });
  const totalClients = await User.countDocuments({ role: 'client' });

  // --- 🔹 Statistiques sur les agences ---
  const totalAgencies = await Agency.countDocuments({ status: { $in: ['active', 'inactive'] } }); // exclut deleted
  const totalActiveAgencies = await Agency.countDocuments({ status: 'active' });
  const totalInactiveAgencies = await Agency.countDocuments({ status: 'inactive' });
  const totalDeletedAgencies = await Agency.countDocuments({ status: 'deleted' });

  // --- 🔹 Statistiques sur les clients mensuels ---
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyClientSubscriptions = await User.countDocuments({
    role: 'client',
    createdAt: { $gte: firstDay, $lte: lastDay },
  });

  const monthlyClientPercentage =
    totalClients > 0 ? ((monthlyClientSubscriptions / totalClients) * 100).toFixed(2) : 0;

  // --- 🔹 Statistiques sur les collectes ---
  const totalCollections = await Collecte.countDocuments(); // toutes les collectes

  // Collectes du jour
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  const dailyCollections = await Collecte.countDocuments({
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  // Collectes du mois
  const monthlyCollections = await Collecte.countDocuments({
    date: { $gte: firstDay, $lte: lastDay },
  });

  // --- 🔹 Retour des statistiques combinées ---
  return {
    // Utilisateurs
    totalMunicipalityAgents,
    totalManagers,
    totalCollectors,
    totalClients,

    // Agences
    totalAgencies,
    totalActiveAgencies,
    totalInactiveAgencies,
    totalDeletedAgencies,

    // Clients mensuels
    monthlyClientSubscriptions,
    monthlyClientPercentage: Number(monthlyClientPercentage),

    // Collectes
    totalCollections,
    dailyCollections,
    monthlyCollections,
  };
};

module.exports = { getDashboardStats };
