const Agency = require('../models/agency');

class AgencySearchService {
    // Recherche unifiée détaillée
    async unifiedSearch({
        // Critères de recherche détaillés
        name = '',
        neighborhood = '',
        activityZone = '',
        sector = '',
        arrondissement = '',
        city = '',
        
        // Recherche géospatiale
        latitude = null,
        longitude = null,
        radius = 10, // rayon en kilomètres
        
        // Filtres supplémentaires
        status = 'active',
        hasOwner = null,
        minGestionnaires = 0,
        
        // Pagination
        page = 1,
        limit = 10,
        getAll = false,
        
        // Options de tri
        sortBy = 'createdAt',
        sortOrder = 'desc'
    }) {
        try {
            const filter = {};

            // Filtre par statut
            if (status) {
                filter.status = status;
            }

            // Construction des conditions de recherche détaillées
            const searchConditions = [];

            // Recherche par nom
            if (name) {
                searchConditions.push(
                    { name: { $regex: name, $options: 'i' } },
                    { agencyDescription: { $regex: name, $options: 'i' } },
                    { slogan: { $regex: name, $options: 'i' } }
                );
            }

            // Recherche par quartier
            if (neighborhood) {
                searchConditions.push({ 
                    'address.neighborhood': { $regex: neighborhood, $options: 'i' } 
                });
            }

            // Recherche par zone d'activité
            if (activityZone) {
                searchConditions.push({ 
                    zoneActivite: { $regex: activityZone, $options: 'i' } 
                });
            }

            // Recherche par secteur
            if (sector) {
                searchConditions.push({ 
                    sector: { $regex: sector, $options: 'i' } 
                });
            }

            // Recherche par arrondissement
            if (arrondissement) {
                searchConditions.push({ 
                    'address.arrondissement': { $regex: arrondissement, $options: 'i' } 
                });
            }

            // Recherche par ville
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
                if (hasOwner === true || hasOwner === 'true') {
                    filter.owner = { $exists: true, $ne: null };
                } else {
                    filter.owner = { $exists: false };
                }
            }

            if (minGestionnaires > 0) {
                filter.$expr = { 
                    $gte: [{ $size: { $ifNull: ['$gestionnaires', []] } }, parseInt(minGestionnaires)] 
                };
            }

            // Construction de la requête de base
            let query;

            // Recherche géospatiale si coordonnées fournies
            if (latitude && longitude) {
                query = Agency.find({
                    ...filter,
                    'location.coordinates': {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [parseFloat(longitude), parseFloat(latitude)]
                            },
                            $maxDistance: radius * 1000 // Conversion en mètres
                        }
                    }
                });
            } else {
                query = Agency.find(filter);
            }

            // Configuration du tri
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Population des relations et application du tri
            query = query
                .populate('owner', 'firstName lastName email phone')
                .populate('gestionnaires', 'firstName lastName email phone role')
                .populate('client', 'firstName lastName email phone')
                .populate('collector', 'firstName lastName email phone')
                .sort(sortOptions);

            // Option pour récupérer tout sans pagination
            if (getAll === 'true' || getAll === true) {
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
                    },
                    searchCriteria: {
                        name,
                        neighborhood,
                        activityZone,
                        sector,
                        arrondissement,
                        city,
                        hasCoordinates: !!(latitude && longitude),
                        radius,
                        status,
                        hasOwner,
                        minGestionnaires
                    }
                };
            }

            // Pagination normale
            const agencies = await query
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            const total = await Agency.countDocuments(filter);

            return {
                success: true,
                data: agencies,
                total,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                searchCriteria: {
                    name,
                    neighborhood,
                    activityZone,
                    sector,
                    arrondissement,
                    city,
                    hasCoordinates: !!(latitude && longitude),
                    radius,
                    status,
                    hasOwner,
                    minGestionnaires
                }
            };

        } catch (error) {
            throw new Error(`Erreur lors de la recherche unifiée d'agences: ${error.message}`);
        }
    }

    // Recherche avancée avec scoring de pertinence
    async advancedSearch({
        searchTerm = '',
        filters = {},
        location = null,
        options = {}
    }) {
        try {
            const {
                name,
                neighborhood,
                activityZone,
                sector,
                arrondissement,
                city,
                status = 'active',
                hasOwner,
                minGestionnaires
            } = filters;

            const {
                page = 1,
                limit = 10,
                sortBy = 'relevance',
                includeInactive = false
            } = options;

            // Construction du pipeline d'agrégation
            const pipeline = [];

            // Étape de matching de base
            const matchStage = {};

            if (!includeInactive) {
                matchStage.status = status;
            }

            // Filtres détaillés
            const detailedFilters = [];

            if (name) {
                detailedFilters.push({ name: { $regex: name, $options: 'i' } });
            }

            if (neighborhood) {
                detailedFilters.push({ 'address.neighborhood': { $regex: neighborhood, $options: 'i' } });
            }

            if (activityZone) {
                detailedFilters.push({ zoneActivite: { $regex: activityZone, $options: 'i' } });
            }

            if (sector) {
                detailedFilters.push({ sector: { $regex: sector, $options: 'i' } });
            }

            if (arrondissement) {
                detailedFilters.push({ 'address.arrondissement': { $regex: arrondissement, $options: 'i' } });
            }

            if (city) {
                detailedFilters.push({ 'address.city': { $regex: city, $options: 'i' } });
            }

            if (hasOwner !== null) {
                if (hasOwner) {
                    matchStage.owner = { $exists: true, $ne: null };
                } else {
                    matchStage.owner = { $exists: false };
                }
            }

            if (minGestionnaires > 0) {
                matchStage.$expr = { 
                    $gte: [{ $size: { $ifNull: ['$gestionnaires', []] } }, parseInt(minGestionnaires)] 
                };
            }

            // Recherche par terme général avec scoring
            if (searchTerm) {
                pipeline.push({
                    $match: {
                        ...matchStage,
                        $text: { $search: searchTerm }
                    }
                });

                pipeline.push({
                    $addFields: {
                        relevanceScore: { $meta: "textScore" }
                    }
                });
            } else if (Object.keys(matchStage).length > 0 || detailedFilters.length > 0) {
                // Application des filtres détaillés
                if (detailedFilters.length > 0) {
                    matchStage.$or = detailedFilters;
                }
                pipeline.push({ $match: matchStage });
            }

            // Recherche géospatiale
            if (location && location.latitude && location.longitude) {
                pipeline.push({
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [location.longitude, location.latitude]
                        },
                        distanceField: "distance",
                        maxDistance: (location.radius || 10) * 1000,
                        spherical: true
                    }
                });
            }

            // Tri
            const sortStage = {};
            if (searchTerm) {
                sortStage.relevanceScore = -1;
            }
            
            if (sortBy === 'distance' && location) {
                sortStage.distance = 1;
            } else if (sortBy === 'name') {
                sortStage.name = 1;
            } else if (sortBy === 'createdAt') {
                sortStage.createdAt = -1;
            } else {
                sortStage.createdAt = -1;
            }

            pipeline.push({ $sort: sortStage });

            // Pagination
            pipeline.push(
                { $skip: (page - 1) * limit },
                { $limit: parseInt(limit) }
            );

            // Population des relations
            pipeline.push(
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'owner'
                    }
                },
                {
                    $unwind: {
                        path: '$owner',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'gestionnaires',
                        foreignField: '_id',
                        as: 'gestionnaires'
                    }
                },
                {
                    $project: {
                        'owner.password': 0,
                        'gestionnaires.password': 0
                    }
                }
            );

            const agencies = await Agency.aggregate(pipeline);

            // Comptage total (sans pagination et population)
            const countPipeline = pipeline.slice(0, -5); // Retirer pagination et population
            countPipeline.push({ $count: 'total' });

            const totalResult = await Agency.aggregate(countPipeline);
            const total = totalResult.length > 0 ? totalResult[0].total : 0;

            return {
                success: true,
                data: agencies,
                total,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                searchSummary: {
                    term: searchTerm,
                    filters: {
                        name: !!name,
                        neighborhood: !!neighborhood,
                        activityZone: !!activityZone,
                        sector: !!sector,
                        arrondissement: !!arrondissement,
                        city: !!city,
                        hasOwner,
                        minGestionnaires
                    },
                    hasLocation: !!(location && location.latitude),
                    sortBy
                }
            };

        } catch (error) {
            throw new Error(`Erreur lors de la recherche avancée: ${error.message}`);
        }
    }

    // Récupérer les métadonnées de recherche (suggestions, filtres disponibles, etc.)
    async getSearchMetadata(query = '') {
        try {
            const metadata = {};

            // Suggestions basées sur la requête
            if (query && query.length >= 2) {
                const suggestions = await Agency.aggregate([
                    {
                        $match: {
                            status: 'active',
                            $or: [
                                { name: { $regex: query, $options: 'i' } },
                                { 'address.neighborhood': { $regex: query, $options: 'i' } },
                                { 'address.city': { $regex: query, $options: 'i' } },
                                { zoneActivite: { $regex: query, $options: 'i' } },
                                { sector: { $regex: query, $options: 'i' } },
                                { 'address.arrondissement': { $regex: query, $options: 'i' } }
                            ]
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            neighborhood: '$address.neighborhood',
                            city: '$address.city',
                            activityZone: '$zoneActivite',
                            sector: 1,
                            arrondissement: '$address.arrondissement',
                            type: {
                                $cond: [
                                    { $regexMatch: { input: '$name', regex: query, options: 'i' } },
                                    'name',
                                    {
                                        $cond: [
                                            { $regexMatch: { input: '$address.neighborhood', regex: query, options: 'i' } },
                                            'neighborhood',
                                            {
                                                $cond: [
                                                    { $regexMatch: { input: '$address.city', regex: query, options: 'i' } },
                                                    'city',
                                                    {
                                                        $cond: [
                                                            { $regexMatch: { input: '$zoneActivite', regex: query, options: 'i' } },
                                                            'activityZone',
                                                            {
                                                                $cond: [
                                                                    { $regexMatch: { input: '$sector', regex: query, options: 'i' } },
                                                                    'sector',
                                                                    'arrondissement'
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    { $limit: 15 }
                ]);

                metadata.suggestions = suggestions;
            }

            // Statistiques générales pour les filtres
            const stats = await Agency.aggregate([
                { $match: { status: 'active' } },
                {
                    $facet: {
                        cities: [
                            { $group: { _id: '$address.city', count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 20 }
                        ],
                        neighborhoods: [
                            { $group: { _id: '$address.neighborhood', count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 20 }
                        ],
                        activityZones: [
                            { $group: { _id: '$zoneActivite', count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 20 }
                        ],
                        sectors: [
                            { $group: { _id: '$sector', count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 20 }
                        ],
                        arrondissements: [
                            { $group: { _id: '$address.arrondissement', count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 20 }
                        ]
                    }
                }
            ]);

            metadata.filters = stats[0];

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