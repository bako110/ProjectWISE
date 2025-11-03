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
                searchTerm,
                
                // Géolocalisation
                latitude,
                longitude,
                radius,
                
                // Filtres
                status,
                hasOwner,
                hasGestionnaires,
                minGestionnaires,
                maxGestionnaires,
                
                // Pagination
                page,
                limit,
                getAll,
                
                // Tri
                sortBy,
                sortOrder
            } = req.query;

            // Validation des paramètres numériques
            const parsedParams = this.parseSearchParams({
                latitude, longitude, radius, minGestionnaires, maxGestionnaires,
                page, limit, getAll, sortBy, sortOrder
            });

            const result = await AgencySearchService.unifiedSearch({
                searchTerm,
                name,
                neighborhood,
                activityZone,
                sector,
                arrondissement,
                city,
                ...parsedParams,
                status: status || 'active',
                hasOwner: hasOwner !== undefined ? hasOwner === 'true' : null,
                hasGestionnaires: hasGestionnaires !== undefined ? hasGestionnaires === 'true' : null
            });

            res.status(200).json(result);
        } catch (error) {
            console.error('Erreur recherche unifiée:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
                hasGestionnaires,
                minGestionnaires,
                maxGestionnaires,
                latitude,
                longitude,
                radius,
                page,
                limit,
                sortBy,
                includeInactive
            } = req.query;

            // Validation des paramètres
            const parsedParams = this.parseSearchParams({
                latitude, longitude, radius, minGestionnaires, maxGestionnaires,
                page, limit, sortBy, includeInactive
            });

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
                    hasGestionnaires: hasGestionnaires !== undefined ? hasGestionnaires === 'true' : null,
                    minGestionnaires: parsedParams.minGestionnaires,
                    maxGestionnaires: parsedParams.maxGestionnaires
                },
                location: parsedParams.latitude && parsedParams.longitude ? {
                    latitude: parsedParams.latitude,
                    longitude: parsedParams.longitude,
                    radius: parsedParams.radius
                } : null,
                options: {
                    page: parsedParams.page,
                    limit: parsedParams.limit,
                    sortBy: parsedParams.sortBy,
                    includeInactive: parsedParams.includeInactive
                }
            });

            res.status(200).json(result);
        } catch (error) {
            console.error('Erreur recherche avancée:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche avancée',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
            console.error('Erreur métadonnées recherche:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des métadonnées',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Méthode utilitaire pour parser les paramètres
    parseSearchParams(params) {
        return {
            latitude: params.latitude ? parseFloat(params.latitude) : null,
            longitude: params.longitude ? parseFloat(params.longitude) : null,
            radius: params.radius ? parseFloat(params.radius) : 10,
            minGestionnaires: params.minGestionnaires ? parseInt(params.minGestionnaires) : 0,
            maxGestionnaires: params.maxGestionnaires ? parseInt(params.maxGestionnaires) : null,
            page: parseInt(params.page) || 1,
            limit: parseInt(params.limit) || 10,
            getAll: params.getAll === 'true',
            sortBy: params.sortBy || 'createdAt',
            sortOrder: params.sortOrder || 'desc',
            includeInactive: params.includeInactive === 'true'
        };
    }
}

module.exports = new AgencySearchController();