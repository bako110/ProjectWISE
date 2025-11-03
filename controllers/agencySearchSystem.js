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

            // Conversion des paramètres avec valeurs par défaut améliorées
            const result = await AgencySearchService.unifiedSearch({
                name: name || '',
                neighborhood: neighborhood || '',
                activityZone: activityZone || '',
                sector: sector || '',
                arrondissement: arrondissement || '',
                city: city || '',
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                radius: radius ? parseFloat(radius) : 10,
                status: status || 'active', // Permet 'all' pour tous les statuts
                hasOwner: hasOwner !== undefined ? 
                    (hasOwner === 'true' || hasOwner === true) : null,
                minGestionnaires: minGestionnaires ? 
                    parseInt(minGestionnaires) : 0,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                getAll: getAll === 'true' || getAll === true,
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc'
            });

            res.status(200).json(result);
        } catch (error) {
            console.error('Erreur recherche unifiée:', error);
            res.status(500).json({
                success: false,
                message: error.message,
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
                searchTerm: searchTerm || '',
                filters: {
                    name: name || '',
                    neighborhood: neighborhood || '',
                    activityZone: activityZone || '',
                    sector: sector || '',
                    arrondissement: arrondissement || '',
                    city: city || '',
                    status: status || 'active', // Permet 'all' pour tous les statuts
                    hasOwner: hasOwner !== undefined ? 
                        (hasOwner === 'true' || hasOwner === true) : null,
                    minGestionnaires: minGestionnaires ? 
                        parseInt(minGestionnaires) : 0
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
                    includeInactive: includeInactive === 'true' || includeInactive === true
                }
            });

            res.status(200).json(result);
        } catch (error) {
            console.error('Erreur recherche avancée:', error);
            res.status(500).json({
                success: false,
                message: error.message,
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    // Métadonnées pour l'interface de recherche
    async getSearchMetadata(req, res) {
        try {
            const { query } = req.query;

            const result = await AgencySearchService.getSearchMetadata(query || '');

            res.status(200).json(result);
        } catch (error) {
            console.error('Erreur métadonnées recherche:', error);
            res.status(500).json({
                success: false,
                message: error.message,
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    // NOUVEAU : Endpoint de santé de la recherche
    async searchHealth(req, res) {
        try {
            // Test simple pour vérifier que le service fonctionne
            const testResult = await AgencySearchService.unifiedSearch({
                limit: 1,
                getAll: false
            });

            res.status(200).json({
                success: true,
                status: 'healthy',
                message: 'Service de recherche fonctionnel',
                testQuery: testResult.success ? 'OK' : 'Erreur',
                totalAgencies: testResult.total,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                status: 'unhealthy',
                message: 'Service de recherche indisponible',
                error: error.message
            });
        }
    }

    // NOUVEAU : Recherche rapide par terme unique
    async quickSearch(req, res) {
        try {
            const { q, page, limit } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Le paramètre de recherche "q" est requis'
                });
            }

            const result = await AgencySearchService.advancedSearch({
                searchTerm: q,
                filters: {
                    status: 'active'
                },
                options: {
                    page: parseInt(page) || 1,
                    limit: parseInt(limit) || 10,
                    sortBy: 'relevance'
                }
            });

            res.status(200).json(result);
        } catch (error) {
            console.error('Erreur recherche rapide:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // NOUVEAU : Recherche par localisation uniquement
    async searchByLocation(req, res) {
        try {
            const { latitude, longitude, radius, page, limit } = req.query;

            if (!latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    message: 'Les paramètres latitude et longitude sont requis'
                });
            }

            const result = await AgencySearchService.unifiedSearch({
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radius: radius ? parseFloat(radius) : 10,
                status: 'active',
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            res.status(200).json(result);
        } catch (error) {
            console.error('Erreur recherche par localisation:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AgencySearchController();