const AgencySearchService = require('../services/agencySearchSystem');

class AgencySearchController {
    
    // ✅ RECHERCHE UNIFIÉE - Adaptée au service simplifié
    async unifiedSearch(req, res) {
        try {
            const {
                // Critères de recherche détaillés
                name,
                neighborhood, 
                activityZone,
                sector,
                arrondissement,
                city,
                
                // Recherche géospatiale
                latitude,
                longitude, 
                radius,
                
                // Filtres supplémentaires
                status,
                hasOwner,
                minGestionnaires,
                
                // Pagination
                page,
                limit,
                getAll,
                
                // Options de tri
                sortBy,
                sortOrder
            } = req.query;

            // Préparation des paramètres pour le service simplifié
            const searchParams = {
                // Chaînes de caractères
                name: name || '',
                neighborhood: neighborhood || '',
                activityZone: activityZone || '',
                sector: sector || '',
                arrondissement: arrondissement || '',
                city: city || '',
                status: status || 'active',
                
                // Géolocalisation
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                radius: radius ? parseFloat(radius) : 10,
                
                // Filtres booléens/number
                hasOwner: hasOwner !== undefined ? (hasOwner === 'true') : null,
                minGestionnaires: minGestionnaires ? parseInt(minGestionnaires) : 0,
                
                // Pagination
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                getAll: getAll === 'true',
                
                // Tri
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc'
            };

            // Validation des paramètres géo (optionnel mais recommandé)
            if ((searchParams.latitude && !searchParams.longitude) || 
                (!searchParams.latitude && searchParams.longitude)) {
                return res.status(400).json({
                    success: false,
                    message: 'Les paramètres latitude et longitude doivent être fournis ensemble'
                });
            }

            // Appel du service
            const result = await AgencySearchService.unifiedSearch(searchParams);

            res.status(200).json(result);

        } catch (error) {
            console.error('❌ Erreur contrôleur recherche unifiée:', error);
            
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche d\'agences',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                timestamp: new Date().toISOString()
            });
        }
    }

    // ✅ RECHERCHE AVANCÉE - Adaptée au service simplifié
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

            // Préparation des paramètres selon la nouvelle structure
            const searchParams = {
                searchTerm: searchTerm || '',
                filters: {
                    name: name || '',
                    neighborhood: neighborhood || '',
                    activityZone: activityZone || '',
                    sector: sector || '',
                    arrondissement: arrondissement || '',
                    city: city || '',
                    status: status || 'active',
                    hasOwner: hasOwner !== undefined ? (hasOwner === 'true') : null,
                    minGestionnaires: minGestionnaires ? parseInt(minGestionnaires) : 0
                },
                location: (latitude && longitude) ? {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    radius: radius ? parseFloat(radius) : 10
                } : null,
                options: {
                    page: page ? parseInt(page) : 1,
                    limit: limit ? parseInt(limit) : 10,
                    sortBy: sortBy || 'createdAt',
                    includeInactive: includeInactive === 'true'
                }
            };

            const result = await AgencySearchService.advancedSearch(searchParams);

            res.status(200).json(result);

        } catch (error) {
            console.error('❌ Erreur contrôleur recherche avancée:', error);
            
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche avancée',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                timestamp: new Date().toISOString()
            });
        }
    }

    // ✅ MÉTADONNÉES DE RECHERCHE - Adaptée au service simplifié
    async getSearchMetadata(req, res) {
        try {
            const { query } = req.query;

            const result = await AgencySearchService.getSearchMetadata(query || '');

            res.status(200).json(result);

        } catch (error) {
            console.error('❌ Erreur contrôleur métadonnées:', error);
            
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des métadonnées',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                timestamp: new Date().toISOString()
            });
        }
    }

    // ✅ NOUVELLE MÉTHODE: Recherche rapide (optionnelle)
    async quickSearch(req, res) {
        try {
            const { q: query, page = 1, limit = 10 } = req.query;

            if (!query || query.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Le terme de recherche doit contenir au moins 2 caractères'
                });
            }

            // Utilisation de unifiedSearch pour une recherche rapide
            const result = await AgencySearchService.unifiedSearch({
                name: query,
                page: parseInt(page),
                limit: parseInt(limit),
                getAll: false,
                sortBy: 'relevance',
                status: 'active'
            });

            res.status(200).json(result);

        } catch (error) {
            console.error('❌ Erreur contrôleur recherche rapide:', error);
            
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche rapide',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new AgencySearchController();