const AgencySearchService = require('../services/agencySearchSystem');

class AgencySearchController {
    // Recherche avancée d'agences
    async searchAgencies(req, res) {
        try {
            const {
                search,
                city,
                neighborhood,
                zoneActivite,
                status,
                page,
                limit,
                getAll,
                latitude,
                longitude,
                radius
            } = req.query;

            let coordinates = null;
            if (latitude && longitude) {
                coordinates = [parseFloat(longitude), parseFloat(latitude)];
            }

            const result = await AgencySearchService.searchAgencies({
                search,
                city,
                neighborhood,
                zoneActivite,
                status,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                getAll: getAll === 'true',
                coordinates,
                radius: parseFloat(radius) || 10
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Recherche en plein texte
    async fullTextSearch(req, res) {
        try {
            const {
                query,
                city,
                neighborhood,
                zoneActivite,
                status,
                page,
                limit
            } = req.query;

            const result = await AgencySearchService.fullTextSearch({
                query,
                city,
                neighborhood,
                zoneActivite,
                status,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Recherche géospatiale
    async geoSearch(req, res) {
        try {
            const {
                latitude,
                longitude,
                radius,
                search,
                city,
                neighborhood,
                status,
                page,
                limit
            } = req.query;

            const result = await AgencySearchService.geoSearch({
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radius: parseFloat(radius) || 10,
                search,
                city,
                neighborhood,
                status,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Recherche par filtres multiples
    async searchByMultipleFilters(req, res) {
        try {
            const {
                search,
                city,
                neighborhood,
                zoneActivite,
                status,
                hasOwner,
                minGestionnaires,
                page,
                limit,
                getAll
            } = req.query;

            const result = await AgencySearchService.searchByMultipleFilters({
                search,
                city,
                neighborhood,
                zoneActivite,
                status,
                hasOwner: hasOwner === 'true',
                minGestionnaires: parseInt(minGestionnaires) || 0,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                getAll: getAll === 'true'
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Suggestions de recherche
    async getSearchSuggestions(req, res) {
        try {
            const { query } = req.query;

            const result = await AgencySearchService.getSearchSuggestions(query);

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