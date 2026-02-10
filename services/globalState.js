const User = require('../models/User');
const Agency = require('../models/agency'); // Vérifie bien le nom du fichier
const Collecte = require('../models/Collecte');

const getDashboardStats = async () => {
  // --- 🔹 Statistiques sur les utilisateurs ---
  const totalMunicipalityAgents = await User.countDocuments({ role: 'municipality' });
  const totalManagers = await User.countDocuments({ role: 'manager' });
  const totalCollectors = await User.countDocuments({ role: 'collector' });
  const totalClients = await User.countDocuments({ role: 'client' });

  // --- 🔹 Statistiques sur les agences ---
  const totalAgencies = await Agency.countDocuments({ status: { $in: ['active', 'inactive'] } });
  const totalActiveAgencies = await Agency.countDocuments({ status: 'active' });
  const totalInactiveAgencies = await Agency.countDocuments({ status: 'inactive' });
  const totalDeletedAgencies = await Agency.countDocuments({ status: 'deleted' });

  // --- 🔹 Nombre d'agences par ville ---
  const agenciesByCity = await Agency.aggregate([
    { $match: { status: { $in: ['active', 'inactive'] } } },
    { $group: { _id: '$address.city', numberOfAgencies: { $sum: 1 } } },
    { $project: { _id: 0, city: '$_id', numberOfAgencies: 1 } }
  ]);

  // --- 🔹 Nombre de clients par ville ---
  const clientsByCity = await User.aggregate([
    { $match: { role: 'client', status: 'active' } },
    { $group: { _id: '$address.city', numberOfClients: { $sum: 1 } } },
    { $project: { _id: 0, city: '$_id', numberOfClients: 1 } }
  ]);

  // --- 🔹 Nombre de collectes par ville ---
  const collectionsByCity = await Collecte.aggregate([
    { $lookup: {
        from: 'users',
        localField: 'clientId',
        foreignField: '_id',
        as: 'client'
    }},
    { $unwind: '$client' },
    { $group: { _id: '$client.address.city', numberOfCollections: { $sum: 1 } } },
    { $project: { _id: 0, city: '$_id', numberOfCollections: 1 } }
  ]);

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
  const totalCollections = await Collecte.countDocuments();
  const totalCollectionReported = await Collecte.countDocuments({ status: 'Reported' });
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  const dailyCollections = await Collecte.countDocuments({
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  const dailyCollectionCollected = await Collecte.countDocuments({
    date: { $gte: startOfDay, $lte: endOfDay },
    status: 'Collected',
  });

  const monthlyCollections = await Collecte.countDocuments({
    date: { $gte: firstDay, $lte: lastDay },
  });

  // --- 🔹 Retour des statistiques combinées ---
  return {
    totalMunicipalityAgents,
    totalManagers,
    totalCollectors,
    totalClients,

    totalAgencies,
    totalActiveAgencies,
    totalInactiveAgencies,
    totalDeletedAgencies,

    agenciesByCity,
    clientsByCity,
    collectionsByCity, // 🔹 Ajouté ici

    monthlyClientSubscriptions,
    monthlyClientPercentage: Number(monthlyClientPercentage),

    totalCollections,
    dailyCollections,
    monthlyCollections,
    totalCollectionReported,
    dailyCollectionCollected
  };
};


const getCollectorStatistics = async (collectorId) => {
  if (!collectorId) throw new Error("L'identifiant du collecteur est requis");

  const collector = await User.findById(collectorId).select('collectes');
  if (!collector) throw new Error("Collecteur non trouvé");

  const dateDebut = new Date( new Date().setHours(0,0,0,0) );
  const dateFin = new Date( new Date().setHours(23,59,59,999) );
  const totalCollectes = await Collecte.countDocuments({ collectorId, date: { $gte: dateDebut, $lte: dateFin } });
  const totalScheduledCollectes = await Collecte.countDocuments({ collectorId, status: 'Scheduled' , date: { $gte: dateDebut, $lte: dateFin } });
  const totalCollectedCollectes = await Collecte.countDocuments({ collectorId, status: 'Collected', date: { $gte: dateDebut, $lte: dateFin } });
  const totalReportedCollectes = await Collecte.countDocuments({ collectorId, status: 'Reported', date: { $gte: dateDebut, $lte: dateFin } });
  return {
    totalCollectes,
    totalScheduledCollectes,
    totalCollectedCollectes,
    totalReportedCollectes,
  };
};

module.exports = { getDashboardStats, getCollectorStatistics };
