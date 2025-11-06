const AgencySearchService = require('../services/agencySearchSystem');

class AgencySearchController {
    
    // ✅ SEULE MÉTHODE PRINCIPALE: Recherche unifiée avec fonctionnalités dynamiques
    async unifiedSearch(req, res) {
    try {
        const {
            name,
            neighborhood,
            activityZone,
            sector,
            arrondissement, // facultatif
            city,
            latitude,
            longitude,
            radius,
            status,
            hasOwner,
            minGestionnaires,
            page,
            limit,
            getAll,
            sortBy,
            sortOrder,
            includeAvailableFilters = 'false'
        } = req.query;

        // Préparer les paramètres pour le service
        const searchParams = {
            name: name || '',
            neighborhood: neighborhood || '',
            activityZone: activityZone || '',
            sector: sector || '',
            arrondissement: arrondissement || '', // facultatif
            city: city || '',
            status: status || 'active',
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            radius: radius ? parseFloat(radius) : 10,
            hasOwner: hasOwner !== undefined ? (hasOwner === 'true') : null,
            minGestionnaires: minGestionnaires ? parseInt(minGestionnaires) : 0,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            getAll: getAll === 'true',
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
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

        // Appel du service unifié
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