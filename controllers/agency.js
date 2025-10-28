const agencyService = require('../services/agency');
const logger = require('../utils/logger');

// Récupérer toutes les agences
exports.getAllAgencies = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;
        
        const result = await agencyService.getAllAgencies({
            status,
            search,
            page: parseInt(page),
            limit: parseInt(limit)
        });
        
        logger.info(`Récupération de ${result.agencies.length} agences sur ${result.total}`);
        
        res.status(200).json({
            success: true,
            data: result.agencies,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des agences:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Récupérer une agence par ID
exports.getAgency = async (req, res) => {
    try {
        const { id } = req.params;
        
        const agency = await agencyService.getAgencyById(id);
        
        res.status(200).json({
            success: true,
            data: agency
        });
    } catch (error) {
        logger.error(`Erreur lors de la récupération de l'agence ${req.params.id}:`, error);
        res.status(404).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Mettre à jour une agence
exports.updateAgency = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedAgency = await agencyService.updateAgency(id, updateData);
        
        logger.info(`Agence ${id} mise à jour avec succès`);
        
        res.status(200).json({
            success: true,
            data: updatedAgency,
            message: 'Agence mise à jour avec succès'
        });
    } catch (error) {
        logger.error(`Erreur lors de la mise à jour de l'agence ${req.params.id}:`, error);
        res.status(404).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Supprimer une agence (soft delete)
exports.deleteAgency = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedAgency = await agencyService.deleteAgency(id);
        
        logger.info(`Agence ${id} supprimée avec succès`);
        
        res.status(200).json({
            success: true,
            data: deletedAgency,
            message: 'Agence supprimée avec succès'
        });
    } catch (error) {
        logger.error(`Erreur lors de la suppression de l'agence ${req.params.id}:`, error);
        res.status(404).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Récupérer les agences par statut
exports.getAgenciesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        
        const agencies = await agencyService.getAgenciesByStatus(status);
        
        res.status(200).json({
            success: true,
            data: agencies,
            count: agencies.length
        });
    } catch (error) {
        logger.error(`Erreur lors de la récupération des agences par statut ${req.params.status}:`, error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Changer le statut d'une agence
exports.changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const agency = await agencyService.changeAgencyStatus(id, status);
        
        logger.info(`Statut de l'agence ${id} changé à: ${status}`);
        
        res.status(200).json({
            success: true,
            data: agency,
            message: `Statut de l'agence changé à ${status} avec succès`
        });
    } catch (error) {
        logger.error(`Erreur lors du changement de statut de l'agence ${req.params.id}:`, error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Activer une agence
exports.activateAgency = async (req, res) => {
    try {
        const { id } = req.params;
        
        const agency = await agencyService.changeAgencyStatus(id, 'active');
        
        logger.info(`Agence ${id} activée`);
        
        res.status(200).json({
            success: true,
            data: agency,
            message: 'Agence activée avec succès'
        });
    } catch (error) {
        logger.error(`Erreur lors de l'activation de l'agence ${req.params.id}:`, error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Désactiver une agence
exports.deactivateAgency = async (req, res) => {
    try {
        const { id } = req.params;
        
        const agency = await agencyService.changeAgencyStatus(id, 'inactive');
        
        logger.info(`Agence ${id} désactivée`);
        
        res.status(200).json({
            success: true,
            data: agency,
            message: 'Agence désactivée avec succès'
        });
    } catch (error) {
        logger.error(`Erreur lors de la désactivation de l'agence ${req.params.id}:`, error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};