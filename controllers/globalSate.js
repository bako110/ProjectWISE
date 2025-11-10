const { getDashboardStats } = require('../services/globalState');

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({
      success: true,
      message: "Statistiques du tableau de bord récupérées avec succès",
      stats,
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
