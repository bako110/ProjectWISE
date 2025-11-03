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

            // Filtre par statut - CORRIGÉ : permettre recherche sans filtre de statut
            if (status && status !== 'all') {
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

            // RECHERCHE PAR SECTEUR CORRIGÉE - utiliser address.sector
            if (sector) {
                searchConditions.push({ 
                    'address.sector': { $regex: sector, $options: 'i' } 
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
                    'address.latitude': { $exists: true, $ne: null },
                    'address.longitude': { $exists: true, $ne: null },
                    $where: `function() {
                        const R = 6371; // Rayon de la Terre en km
                        const lat1 = ${parseFloat(latitude)};
                        const lon1 = ${parseFloat(longitude)};
                        const lat2 = this.address.latitude;
                        const lon2 = this.address.longitude;
                        
                        const dLat = (lat2 - lat1) * Math.PI / 180;
                        const dLon = (lon2 - lon1) * Math.PI / 180;
                        const a = 
                            Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                            Math.sin(dLon/2) * Math.sin(dLon/2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                        const distance = R * c;
                        
                        return distance <= ${parseFloat(radius)};
                    }`
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

    // Recherche avancée avec scoring de pertinence - CORRIGÉE
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

            // Étape de matching de base - CORRIGÉ : gestion du statut
            const matchStage = {};

            if (status && status !== 'all' && !includeInactive) {
                matchStage.status = status;
            }

            // Filtres détaillés - CORRIGÉS : champs address
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

            // CORRECTION : address.sector au lieu de sector
            if (sector) {
                detailedFilters.push({ 'address.sector': { $regex: sector, $options: 'i' } });
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
                        $or: [
                            { name: { $regex: searchTerm, $options: 'i' } },
                            { agencyDescription: { $regex: searchTerm, $options: 'i' } },
                            { slogan: { $regex: searchTerm, $options: 'i' } },
                            { 'address.neighborhood': { $regex: searchTerm, $options: 'i' } },
                            { 'address.city': { $regex: searchTerm, $options: 'i' } },
                            { zoneActivite: { $regex: searchTerm, $options: 'i' } },
                            { 'address.sector': { $regex: searchTerm, $options: 'i' } },
                            { 'address.arrondissement': { $regex: searchTerm, $options: 'i' } }
                        ]
                    }
                });

                // Ajout du score de pertinence manuel
                pipeline.push({
                    $addFields: {
                        relevanceScore: {
                            $cond: [
                                { $regexMatch: { input: '$name', regex: searchTerm, options: 'i' } },
                                3, // Score le plus élevé pour le nom
                                {
                                    $cond: [
                                        { $regexMatch: { input: '$agencyDescription', regex: searchTerm, options: 'i' } },
                                        2,
                                        {
                                            $cond: [
                                                { $regexMatch: { input: '$slogan', regex: searchTerm, options: 'i' } },
                                                2,
                                                1 // Score de base pour les autres champs
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                });
            } else if (Object.keys(matchStage).length > 0 || detailedFilters.length > 0) {
                // Application des filtres détaillés
                if (detailedFilters.length > 0) {
                    matchStage.$or = detailedFilters;
                }
                pipeline.push({ $match: matchStage });
            } else {
                // Si aucun critère, retourner toutes les agences (avec filtre de statut si applicable)
                pipeline.push({ $match: matchStage });
            }

            // Recherche géospatiale simplifiée
            if (location && location.latitude && location.longitude) {
                pipeline.push({
                    $addFields: {
                        distance: {
                            $let: {
                                vars: {
                                    R: 6371, // Rayon Terre en km
                                    lat1: { $degreesToRadians: location.latitude },
                                    lon1: { $degreesToRadians: location.longitude },
                                    lat2: { $degreesToRadians: '$address.latitude' },
                                    lon2: { $degreesToRadians: '$address.longitude' },
                                    dLat: { $subtract: ['$lat2', '$lat1'] },
                                    dLon: { $subtract: ['$lon2', '$lon1'] },
                                    a: {
                                        $add: [
                                            { $multiply: [{ $sin: { $divide: ['$dLat', 2] } }, { $sin: { $divide: ['$dLat', 2] } }] },
                                            { $multiply: [
                                                { $multiply: [{ $cos: '$lat1' }, { $cos: '$lat2' }] },
                                                { $multiply: [{ $sin: { $divide: ['$dLon', 2] } }, { $sin: { $divide: ['$dLon', 2] } }] }
                                            ] }
                                        ]
                                    },
                                    c: { $multiply: [2, { $atan2: [{ $sqrt: '$a' }, { $sqrt: { $subtract: [1, '$a'] } }] }] }
                                },
                                in: { $multiply: ['$R', '$c'] }
                            }
                        }
                    }
                });

                // Filtrer par distance
                pipeline.push({
                    $match: {
                        'address.latitude': { $exists: true, $ne: null },
                        'address.longitude': { $exists: true, $ne: null },
                        distance: { $lte: location.radius || 10 }
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
            const skip = (page - 1) * limit;
            pipeline.push(
                { $skip: skip },
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

            // Comptage total
            const countPipeline = [...pipeline];
            countPipeline.splice(countPipeline.length - 5, 5); // Retirer pagination et population
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

    // Récupérer les métadonnées de recherche (suggestions, filtres disponibles, etc.) - CORRIGÉ
    async getSearchMetadata(query = '') {
        try {
            const metadata = {};

            // Suggestions basées sur la requête - CORRIGÉ : champs address
            if (query && query.length >= 2) {
                const suggestions = await Agency.aggregate([
                    {
                        $match: {
                            $or: [
                                { name: { $regex: query, $options: 'i' } },
                                { 'address.neighborhood': { $regex: query, $options: 'i' } },
                                { 'address.city': { $regex: query, $options: 'i' } },
                                { zoneActivite: { $regex: query, $options: 'i' } },
                                { 'address.sector': { $regex: query, $options: 'i' } },
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
                            sector: '$address.sector',
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
                                                                    { $regexMatch: { input: '$address.sector', regex: query, options: 'i' } },
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

            // Statistiques générales pour les filtres - CORRIGÉ : champs address
            const stats = await Agency.aggregate([
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
                            { $unwind: '$zoneActivite' },
                            { $group: { _id: '$zoneActivite', count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 20 }
                        ],
                        sectors: [
                            { $group: { _id: '$address.sector', count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 20 }
                        ],
                        arrondissements: [
                            { $group: { _id: '$address.arrondissement', count: { $sum: 1 } } },
                            { $sort: { count: -1 } },
                            { $limit: 20 }
                        ],
                        statusCounts: [
                            { $group: { _id: '$status', count: { $sum: 1 } } }
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