const { getDashboardStats, getCollectorStatistics } = require('../services/globalState');

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStats();

    res.status(200).json({
      success: true,
      message: "Statistiques du tableau de bord récupérées avec succès",
      stats: {
        // 👤 Utilisateurs
        totalMunicipalityAgents: stats.totalMunicipalityAgents,
        totalManagers: stats.totalManagers,
        totalCollectors: stats.totalCollectors,
        totalClients: stats.totalClients,

        // 🏢 Agences
        totalAgencies: stats.totalAgencies,
        totalActiveAgencies: stats.totalActiveAgencies,
        totalInactiveAgencies: stats.totalInactiveAgencies,
        totalDeletedAgencies: stats.totalDeletedAgencies,
        agenciesByCity: stats.agenciesByCity,       // 🔹 Nombre d’agences par ville

        // 👥 Clients
        clientsByCity: stats.clientsByCity,         // 🔹 Nombre de clients par ville

        // 💰 Collectes
        collectionsByCity: stats.collectionsByCity, // 🔹 Nombre de collectes par ville
        totalCollections: stats.totalCollections,
        dailyCollections: stats.dailyCollections,
        monthlyCollections: stats.monthlyCollections,

        // 👥 Clients mensuels
        monthlyClientSubscriptions: stats.monthlyClientSubscriptions,
        monthlyClientPercentage: stats.monthlyClientPercentage,
      }
    });
  } catch (error) {
    console.error("Erreur statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des statistiques",
      error: error.message,
    });
  }
};

exports.getCollectorStatistics = async (req, res) => {
  try {
    const { collectorId } = req.params;
    const stats = await getCollectorStatistics(collectorId);

    res.status(200).json({
      success: true,
      message: "Statistiques du collecteur récupérées avec succès",
      stats: {
        totalCollectes: stats.totalCollectes,
        totalScheduledCollectes: stats.totalScheduledCollectes,
        totalCollectedCollectes: stats.totalCollectedCollectes,
        totalReportedCollectes: stats.totalReportedCollectes,
      }
    });
  } catch (error) {
    console.error("Erreur statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des statistiques",
      error: error.message,
    });
  }
};
