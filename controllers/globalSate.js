const { getDashboardStats } = require('../services/globalState');

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
        totalAgencies: stats.totalAgencies,               // Toutes les agences (actives + inactives)
        totalActiveAgencies: stats.totalActiveAgencies,   // Agences actives
        totalInactiveAgencies: stats.totalInactiveAgencies, // Agences inactives
        totalDeletedAgencies: stats.totalDeletedAgencies, // Agences supprimées

        // 👥 Clients mensuels
        monthlyClientSubscriptions: stats.monthlyClientSubscriptions,
        monthlyClientPercentage: stats.monthlyClientPercentage,

        // 💰 Collectes
        totalCollections: stats.totalCollections,   // Nombre total de collectes
        dailyCollections: stats.dailyCollections,   // Collectes du jour
        monthlyCollections: stats.monthlyCollections // Collectes du mois
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
