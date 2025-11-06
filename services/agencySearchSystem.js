const Agency = require('../models/agency');

class AgencySearchService {
    
    async unifiedSearch({
    name = '',
    neighborhood = '',
    activityZone = '',
    sector = '',
    arrondissement = '', // facultatif
    city = '',
    latitude = null,
    longitude = null,
    radius = 10,
    status = 'active',
    hasOwner = null,
    minGestionnaires = 0,
    page = 1,
    limit = 10,
    getAll = false,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    includeAvailableFilters = false
}) {
    try {
        const filter = {};

        // Filtre par statut
        if (status && status !== 'all') filter.status = status;

        // Hiérarchie ville → secteur → quartier
        if (city) filter['address.city'] = { $regex: city, $options: 'i' };
        if (sector) filter['address.sector'] = { $regex: sector, $options: 'i' };
        if (neighborhood) filter['address.neighborhood'] = { $regex: neighborhood, $options: 'i' };

        // Conditions de recherche additionnelles
        const orConditions = [];
        if (name) {
            orConditions.push(
                { name: { $regex: name, $options: 'i' } },
                { agencyDescription: { $regex: name, $options: 'i' } },
                { slogan: { $regex: name, $options: 'i' } }
            );
        }
        if (activityZone) {
            orConditions.push({ zoneActivite: { $in: [new RegExp(activityZone, 'i')] } });
        }

        // Recherche additionnelle si pas filtré par la hiérarchie
        if (sector && !filter['address.sector']) orConditions.push({ 'address.sector': { $regex: sector, $options: 'i' } });
        if (neighborhood && !filter['address.neighborhood']) orConditions.push({ 'address.neighborhood': { $regex: neighborhood, $options: 'i' } });
        if (city && !filter['address.city']) orConditions.push({ 'address.city': { $regex: city, $options: 'i' } });

        if (orConditions.length > 0) filter.$or = orConditions;

        // Filtres supplémentaires
        if (hasOwner !== null) filter.owner = hasOwner ? { $exists: true, $ne: null } : { $exists: false };
        if (minGestionnaires > 0) filter.$expr = { $gte: [{ $size: { $ifNull: ['$gestionnaires', []] } }, minGestionnaires] };

        // Géolocalisation
        if (latitude && longitude) {
            filter['address.latitude'] = { $exists: true, $ne: null };
            filter['address.longitude'] = { $exists: true, $ne: null };
        }

        // Construction de la requête
        let query = Agency.find(filter)
            .populate('owner', 'firstName lastName email phone')
            .populate('gestionnaires', 'firstName lastName email phone')
            .populate('client', 'firstName lastName email phone')
            .populate('collector', 'firstName lastName email phone')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

        const total = await Agency.countDocuments(filter);

        let agencies;
        if (getAll) {
            agencies = await query;
        } else {
            agencies = await query.skip((page - 1) * limit).limit(limit);
        }

        // Filtrage géospatial
        if (latitude && longitude) agencies = this.filterByDistance(agencies, latitude, longitude, radius);

        // Filtres disponibles
        let availableFilters = null;
        if (includeAvailableFilters) availableFilters = await this.getAvailableFilters({ city, sector });

        return {
            success: true,
            data: agencies,
            total: agencies.length,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: agencies.length,
                totalPages: Math.ceil(agencies.length / limit)
            },
            searchContext: {
                filtersUsed: { city: !!city, sector: !!sector, neighborhood: !!neighborhood, activityZone: !!activityZone, name: !!name },
                availableFilters: availableFilters?.availableFilters || null,
                hierarchicalPath: { city: city || null, sector: sector || null, neighborhood: neighborhood || null }
            }
        };

    } catch (error) {
        console.error('Erreur recherche agences:', error);
        throw new Error(`Erreur lors de la recherche d'agences: ${error.message}`);
    }
}

    // Méthode utilitaire pour récupérer les filtres disponibles
    async getAvailableFilters(currentFilters = {}) {
        try {
            const { city = '', arrondissement = '', sector = '' } = currentFilters;
            
            const baseMatch = { status: 'active' };
            const addressMatch = {};
            
            // Construction du match de base selon la hiérarchie
            if (city) {
                addressMatch['address.city'] = { $regex: city, $options: 'i' };
                
                if (arrondissement) {
                    addressMatch['address.arrondissement'] = { $regex: arrondissement, $options: 'i' };
                    
                    if (sector) {
                        addressMatch['address.sector'] = { $regex: sector, $options: 'i' };
                    }
                }
            }
            
            // Fusion des conditions
            Object.assign(baseMatch, addressMatch);
            
            const [
                cities,
                arrondissements,
                sectors,
                neighborhoods,
                activityZones
            ] = await Promise.all([
                // Villes disponibles
                Agency.distinct('address.city', { status: 'active' }),
                
                // Arrondissements (filtrés par ville si spécifiée)
                Agency.distinct('address.arrondissement', baseMatch),
                
                // Secteurs (filtrés par ville/arrondissement)
                Agency.distinct('address.sector', baseMatch),
                
                // Quartiers (filtrés par ville/arrondissement/secteur)
                Agency.distinct('address.neighborhood', baseMatch),
                
                // Zones d'activité (toutes)
                Agency.aggregate([
                    { $match: { status: 'active' } },
                    { $unwind: '$zoneActivite' },
                    { $group: { _id: '$zoneActivite', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ])
            ]);
            
            return {
                success: true,
                availableFilters: {
                    cities: cities.filter(c => c && c.trim() !== '').sort(),
                    arrondissements: arrondissements.filter(a => a && a.trim() !== '').sort(),
                    sectors: sectors.filter(s => s && s.trim() !== '').sort(),
                    neighborhoods: neighborhoods.filter(n => n && n.trim() !== '').sort(),
                    activityZones: activityZones.map(zone => ({
                        name: zone._id,
                        count: zone.count
                    }))
                },
                currentSelection: {
                    city: city || null,
                    arrondissement: arrondissement || null,
                    sector: sector || null
                }
            };
            
        } catch (error) {
            console.error('Erreur récupération filtres:', error);
            throw new Error(`Erreur récupération filtres: ${error.message}`);
        }
    }
    
    // Méthodes utilitaires existantes...
    filterByDistance(agencies, lat, lng, radius) {
        return agencies.filter(agency => {
            if (!agency.address?.latitude || !agency.address?.longitude) {
                return false;
            }
            
            const distance = this.calculateDistance(
                lat, lng,
                agency.address.latitude, agency.address.longitude
            );
            
            return distance <= radius;
        });
    }
    
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    toRad(degrees) {
        return degrees * (Math.PI/180);
    }



    async advancedSearch({
        searchTerm = '',
        filters = {},
        location = null,
        options = {}
    }) {
        try {
            // Utilisation de unifiedSearch avec mapping des paramètres
            const result = await this.unifiedSearch({
                name: searchTerm || filters.name || '',
                neighborhood: filters.neighborhood || '',
                activityZone: filters.activityZone || '',
                sector: filters.sector || '',
                arrondissement: filters.arrondissement || '',
                city: filters.city || '',
                latitude: location?.latitude || null,
                longitude: location?.longitude || null,
                radius: location?.radius || 10,
                status: filters.status || 'active',
                hasOwner: filters.hasOwner || null,
                minGestionnaires: filters.minGestionnaires || 0,
                page: options.page || 1,
                limit: options.limit || 10,
                getAll: false,
                sortBy: options.sortBy || 'createdAt',
                sortOrder: 'desc'
            });
            
            return {
                ...result,
                searchSummary: {
                    term: searchTerm,
                    filters: {
                        name: !!filters.name,
                        neighborhood: !!filters.neighborhood,
                        activityZone: !!filters.activityZone,
                        sector: !!filters.sector,
                        arrondissement: !!filters.arrondissement,
                        city: !!filters.city,
                        hasOwner: filters.hasOwner,
                        minGestionnaires: filters.minGestionnaires
                    },
                    hasLocation: !!(location && location.latitude)
                }
            };
            
        } catch (error) {
            throw new Error(`Erreur lors de la recherche avancée: ${error.message}`);
        }
    }

    async getSearchMetadata(query = '') {
        try {
            const metadata = {
                suggestions: [],
                filters: {
                    cities: [],
                    neighborhoods: [],
                    activityZones: [],
                    sectors: [],
                    arrondissements: []
                }
            };

            // Suggestions
            if (query && query.length >= 2) {
                const suggestions = await Agency.find({
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { 'address.city': { $regex: query, $options: 'i' } },
                        { 'address.neighborhood': { $regex: query, $options: 'i' } }
                    ]
                })
                .select('name address.city address.neighborhood')
                .limit(10);
                
                metadata.suggestions = suggestions;
            }

            // Statistiques pour les filtres
            const [cities, neighborhoods, activityZones] = await Promise.all([
                Agency.aggregate([
                    { $match: { 'address.city': { $exists: true, $ne: '' } } },
                    { $group: { _id: '$address.city', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 15 }
                ]),
                Agency.aggregate([
                    { $match: { 'address.neighborhood': { $exists: true, $ne: '' } } },
                    { $group: { _id: '$address.neighborhood', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 15 }
                ]),
                Agency.aggregate([
                    { $unwind: '$zoneActivite' },
                    { $group: { _id: '$zoneActivite', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 15 }
                ])
            ]);

            metadata.filters.cities = cities;
            metadata.filters.neighborhoods = neighborhoods;
            metadata.filters.activityZones = activityZones;

            return {
                success: true,
                metadata
            };

        } catch (error) {
            throw new Error(`Erreur lors de la récupération des métadonnées: ${error.message}`);
        }
    }
}

module.exports = new AgencySearchService();