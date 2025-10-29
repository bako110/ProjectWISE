const AgencySearchService = require('../services/agencySearchSystem');

class AgencySearchController {
    // Recherche unifiée détaillée - ENDPOINT PRINCIPAL
    async unifiedSearch(req, res) {
        try {
            const {
                // Critères détaillés
                name,
                neighborhood,
                activityZone,
                sector,
                arrondissement,
                city,
                
                // Géolocalisation
                latitude,
                longitude,
                radius,
                
                // Filtres
                status,
                hasOwner,
                minGestionnaires,
                
                // Pagination
                page,
                limit,
                getAll,
                
                // Tri
                sortBy,
                sortOrder
            } = req.query;

            const result = await AgencySearchService.unifiedSearch({
                name,
                neighborhood,
                activityZone,
                sector,
                arrondissement,
                city,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                radius: radius ? parseFloat(radius) : 10,
                status: status || 'active',
                hasOwner: hasOwner !== undefined ? hasOwner === 'true' : null,
                minGestionnaires: minGestionnaires ? parseInt(minGestionnaires) : 0,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                getAll: getAll === 'true',
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc'
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Recherche avancée avec scoring
    async advancedSearch(req, res) {
        try {
            const {
                searchTerm,
                name,
                neighborhood,
                activityZone,
                sector,
                arrondissement,
                city,
                status,
                hasOwner,
                minGestionnaires,
                latitude,
                longitude,
                radius,
                page,
                limit,
                sortBy,
                includeInactive
            } = req.query;

            const result = await AgencySearchService.advancedSearch({
                searchTerm,
                filters: {
                    name,
                    neighborhood,
                    activityZone,
                    sector,
                    arrondissement,
                    city,
                    status: status || 'active',
                    hasOwner: hasOwner !== undefined ? hasOwner === 'true' : null,
                    minGestionnaires: minGestionnaires ? parseInt(minGestionnaires) : 0
                },
                location: latitude && longitude ? {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    radius: radius ? parseFloat(radius) : 10
                } : null,
                options: {
                    page: parseInt(page) || 1,
                    limit: parseInt(limit) || 10,
                    sortBy: sortBy || 'relevance',
                    includeInactive: includeInactive === 'true'
                }
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Métadonnées pour l'interface de recherche
    async getSearchMetadata(req, res) {
        try {
            const { query } = req.query;

            const result = await AgencySearchService.getSearchMetadata(query);

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AgencySearchController();