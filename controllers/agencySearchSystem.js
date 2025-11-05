const AgencySearchService = require('../services/agencySearchSystem');

class AgencySearchController {
    
    // ✅ SEULE MÉTHODE PRINCIPALE: Recherche unifiée avec fonctionnalités dynamiques
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
                sortOrder,
                
                // NOUVEAU: Option pour la recherche dynamique
                includeAvailableFilters = 'false'
            } = req.query;

            // Préparation des paramètres
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
                sortOrder: sortOrder || 'desc',
                
                // NOUVEAU: Inclure les filtres disponibles
                includeAvailableFilters: includeAvailableFilters === 'true'
            };

            // Validation des paramètres géo
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

    // ✅ DEUXIÈME MÉTHODE: Récupération des métadonnées et suggestions
    async getSearchMetadata(req, res) {
        try {
            const { 
                query,
                city,
                arrondissement, 
                sector 
            } = req.query;

            // Si des filtres géographiques sont fournis, retourner les filtres disponibles
            if (city || arrondissement || sector) {
                const currentFilters = {
                    city: city || '',
                    arrondissement: arrondissement || '',
                    sector: sector || ''
                };

                const result = await AgencySearchService.getAvailableFilters(currentFilters);
                return res.status(200).json(result);
            }

            // Sinon, retourner les métadonnées classiques
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

    // ❌ SUPPRIMER: Toutes les autres méthodes (hierarchicalSearch, dynamicSearch, etc.)
}

module.exports = new AgencySearchController();