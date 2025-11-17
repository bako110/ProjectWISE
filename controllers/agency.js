const agencyService = require('../services/agency');
const logger = require('../utils/logger');

// 🔹 Récupérer toutes les agences
exports.getAllAgencies = async (req, res) => {
    try {
        const { status, term, page = 1, limit = 10 } = req.query;

        const result = await agencyService.getAllAgencies({
            status,
            term,
            page: parseInt(page),
            limit: parseInt(limit),
        });

        logger.info(`Récupération de ${result.agencies.length} agences sur ${result.total}`);

        res.status(200).json({
            success: true,
            data: result.agencies,
            pagination: result.pagination,
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des agences:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};


// 🔹 Récupérer une agence par ID
exports.getAgency = async (req, res) => {
  try {
    const { id } = req.params;

    const agency = await agencyService.getAgencyById(id);
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agence introuvable',
      });
    }

    res.status(200).json({
      success: true,
      data: agency,
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'agence ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 🔹 Mettre à jour une agence
exports.updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedAgency = await agencyService.updateAgency(id, updateData);

    logger.info(`Agence ${id} mise à jour avec succès`);

    res.status(200).json({
      success: true,
      data: updatedAgency,
      message: 'Agence mise à jour avec succès',
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour de l'agence ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 🔹 Supprimer une agence (soft delete)
exports.deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAgency = await agencyService.deleteAgency(id);

    logger.info(`Agence ${id} supprimée avec succès`);

    res.status(200).json({
      success: true,
      data: deletedAgency,
      message: 'Agence supprimée avec succès',
    });
  } catch (error) {
    logger.error(`Erreur lors de la suppression de l'agence ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 🔹 Récupérer les agences par statut
exports.getAgenciesByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const agencies = await agencyService.getAgenciesByStatus(status);

    res.status(200).json({
      success: true,
      data: agencies,
      count: agencies.length,
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des agences par statut ${req.params.status}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 🔹 Récupérer les zones d’activité d’une agence
exports.getZones = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const zones = await agencyService.getAgencyZones(agencyId);

    return res.status(200).json({
      success: true,
      message: 'Zones d’activité récupérées avec succès',
      data: zones,
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des zones pour l'agence ${req.params.agencyId}:`, error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des zones',
    });
  }
};

// 🔹 Mettre à jour ou supprimer des zones
exports.upadateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { delete: isDelete = false } = req.query;
    const newZones = req.body.zones;

    let updatedAgency;

    if (isDelete === 'true' || isDelete === true) {
      updatedAgency = await agencyService.removeAgencyZones(id, newZones);
      logger.info(`Zones supprimées pour l'agence ${id}`);
    } else {
      updatedAgency = await agencyService.updateAgencyZone(id, newZones);
      logger.info(`Zones mises à jour pour l'agence ${id}`);
    }

    res.status(200).json({
      success: true,
      data: updatedAgency,
      message: "Zones mises à jour avec succès",
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour des zones de l'agence ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
