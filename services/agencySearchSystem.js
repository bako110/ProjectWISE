const Agency = require('../models/agency');

class AgencySearchService {
    
    async unifiedSearch({
        name = '',
        neighborhood = '',
        activityZone = '',
        sector = '',
        arrondissement = '',
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
        sortOrder = 'desc'
    }) {
        try {
            // ÉTAPE 1: Construction du filtre principal
            const filter = {};
            
            // Filtre par statut
            if (status && status !== 'all') {
                filter.status = status;
            }
            
            // Conditions de recherche
            const searchConditions = [];
            
            // Recherche par nom, description, slogan
            if (name) {
                searchConditions.push(
                    { name: { $regex: name, $options: 'i' } },
                    { agencyDescription: { $regex: name, $options: 'i' } },
                    { slogan: { $regex: name, $options: 'i' } }
                );
            }
            
            // Recherche dans zoneActivite (tableau)
            if (activityZone) {
                searchConditions.push({
                    zoneActivite: { $in: [new RegExp(activityZone, 'i')] }
                });
            }
            
            // Recherche dans l'adresse
            if (neighborhood) {
                searchConditions.push({
                    'address.neighborhood': { $regex: neighborhood, $options: 'i' }
                });
            }
            
            if (sector) {
                searchConditions.push({
                    'address.sector': { $regex: sector, $options: 'i' }
                });
            }
            
            if (arrondissement) {
                searchConditions.push({
                    'address.arrondissement': { $regex: arrondissement, $options: 'i' }
                });
            }
            
            if (city) {
                searchConditions.push({
                    'address.city': { $regex: city, $options: 'i' }
                });
            }
            
            // Application des conditions de recherche
            if (searchConditions.length > 0) {
                filter.$or = searchConditions;
            }
            
            // Filtres supplémentaires
            if (hasOwner !== null) {
                filter.owner = hasOwner ? { $exists: true, $ne: null } : { $exists: false };
            }
            
            if (minGestionnaires > 0) {
                filter.$expr = {
                    $gte: [{ $size: { $ifNull: ['$gestionnaires', []] } }, minGestionnaires]
                };
            }
            
            // Recherche géospatiale SIMPLIFIÉE
            if (latitude && longitude) {
                filter['address.latitude'] = { $exists: true, $ne: null };
                filter['address.longitude'] = { $exists: true, $ne: null };
                // Le filtrage par distance se fera côté application pour l'instant
            }
            
            // ÉTAPE 2: Construction de la requête
            let query = Agency.find(filter);
            
            // Tri
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
            query = query.sort(sortOptions);
            
            // Population des relations
            query = query
                .populate('owner', 'firstName lastName email phone')
                .populate('gestionnaires', 'firstName lastName email phone')
                .populate('client', 'firstName lastName email phone')
                .populate('collector', 'firstName lastName email phone');
            
            // ÉTAPE 3: Exécution
            if (getAll) {
                const agencies = await query;
                const total = await Agency.countDocuments(filter);
                
                return {
                    success: true,
                    data: agencies,
                    total,
                    pagination: {
                        page: 1,
                        limit: total,
                        total,
                        totalPages: 1
                    }
                };
            }
            
            // Pagination
            const agencies = await query
                .skip((page - 1) * limit)
                .limit(limit);
                
            const total = await Agency.countDocuments(filter);
            
            // Filtrage géospatial côté application (simplifié)
            let filteredAgencies = agencies;
            if (latitude && longitude) {
                filteredAgencies = this.filterByDistance(agencies, latitude, longitude, radius);
            }
            
            return {
                success: true,
                data: filteredAgencies,
                total: filteredAgencies.length,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: filteredAgencies.length,
                    totalPages: Math.ceil(filteredAgencies.length / limit)
                }
            };
            
        } catch (error) {
            console.error('Erreur recherche agences:', error);
            throw new Error(`Erreur lors de la recherche d'agences: ${error.message}`);
        }
    }
    
    // Méthode utilitaire pour le filtrage par distance
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
    
    // Calcul de distance (formule de Haversine)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Rayon de la Terre en km
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