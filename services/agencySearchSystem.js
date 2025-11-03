const Agency = require('../models/agency');

class AgencySearchService {
    // Recherche unifiée détaillée - ADAPTÉE AU MODÈLE RÉEL
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
            if (status && status !== 'all') {
                filter.status = status;
            }

            // Construction des conditions de recherche détaillées
            const searchConditions = [];

            // Recherche par nom (champs Agency)
            if (name) {
                searchConditions.push(
                    { name: { $regex: name, $options: 'i' } },
                    { agencyDescription: { $regex: name, $options: 'i' } },
                    { slogan: { $regex: name, $options: 'i' } }
                );
            }

            // Recherche par quartier (dans address Agency)
            if (neighborhood) {
                searchConditions.push({ 
                    'address.neighborhood': { $regex: neighborhood, $options: 'i' } 
                });
            }

            // Recherche par zone d'activité (dans Agency)
            if (activityZone) {
                searchConditions.push({ 
                    zoneActivite: { $regex: activityZone, $options: 'i' } 
                });
            }

            // Recherche par secteur (dans address Agency)
            if (sector) {
                searchConditions.push({ 
                    'address.sector': { $regex: sector, $options: 'i' } 
                });
            }

            // Recherche par arrondissement (dans address Agency)
            if (arrondissement) {
                searchConditions.push({ 
                    'address.arrondissement': { $regex: arrondissement, $options: 'i' } 
                });
            }

            // Recherche par ville (dans address Agency)
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
            let query = Agency.find(filter);

            // Recherche géospatiale si coordonnées fournies
            if (latitude && longitude) {
                // Utilisation des coordonnées dans address.latitude/address.longitude
                query = Agency.find({
                    ...filter,
                    'address.latitude': { $exists: true, $ne: null },
                    'address.longitude': { $exists: true, $ne: null },
                    $where: `function() {
                        if (!this.address.latitude || !this.address.longitude) return false;
                        
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

            if (status && status !== 'all' && !includeInactive) {
                matchStage.status = status;
            }

            // Filtres détaillés - TOUS DANS LE MODÈLE AGENCY
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
                            $add: [
                                {
                                    $cond: [
                                        { $regexMatch: { input: '$name', regex: searchTerm, options: 'i' } },
                                        3, // Score le plus élevé pour le nom
                                        0
                                    ]
                                },
                                {
                                    $cond: [
                                        { $regexMatch: { input: '$agencyDescription', regex: searchTerm, options: 'i' } },
                                        2,
                                        0
                                    ]
                                },
                                {
                                    $cond: [
                                        { $regexMatch: { input: '$slogan', regex: searchTerm, options: 'i' } },
                                        2,
                                        0
                                    ]
                                },
                                {
                                    $cond: [
                                        { $regexMatch: { input: '$address.neighborhood', regex: searchTerm, options: 'i' } },
                                        1,
                                        0
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
            }

            // Recherche géospatiale via aggregation
            if (location && location.latitude && location.longitude) {
                pipeline.push({
                    $addFields: {
                        distance: {
                            $let: {
                                vars: {
                                    R: 6371,
                                    lat1: location.latitude,
                                    lon1: location.longitude,
                                    lat2: '$address.latitude',
                                    lon2: '$address.longitude',
                                    dLat: { $degreesToRadians: { $subtract: ['$lat2', '$lat1'] } },
                                    dLon: { $degreesToRadians: { $subtract: ['$lon2', '$lon1'] } }
                                },
                                in: {
                                    $multiply: [
                                        '$R',
                                        {
                                            $acos: {
                                                $add: [
                                                    { $multiply: [{ $cos: { $degreesToRadians: '$lat1' } }, { $cos: { $degreesToRadians: '$lat2' } }, { $cos: '$dLon' }] },
                                                    { $multiply: [{ $sin: { $degreesToRadians: '$lat1' } }, { $sin: { $degreesToRadians: '$lat2' } }] }
                                                ]
                                            }
                                        }
                                    ]
                                }
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
                    $lookup: {
                        from: 'users',
                        localField: 'client',
                        foreignField: '_id',
                        as: 'client'
                    }
                },
                {
                    $unwind: {
                        path: '$client',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'collector',
                        foreignField: '_id',
                        as: 'collector'
                    }
                },
                {
                    $unwind: {
                        path: '$collector',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        'owner.password': 0,
                        'gestionnaires.password': 0,
                        'client.password': 0,
                        'collector.password': 0
                    }
                }
            );

            const agencies = await Agency.aggregate(pipeline);

            // Comptage total
            const countResult = await Agency.aggregate([
                ...pipeline.slice(0, -8), // Retirer pagination et population
                { $count: 'total' }
            ]);

            const total = countResult.length > 0 ? countResult[0].total : 0;

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

    // Récupérer les métadonnées de recherche
    async getSearchMetadata(query = '') {
        try {
            const metadata = {};

            // Suggestions basées sur la requête
            if (query && query.length >= 2) {
                const suggestions = await Agency.aggregate([
                    {
                        $match: {
                            $or: [
                                { name: { $regex: query, $options: 'i' } },
                                { agencyDescription: { $regex: query, $options: 'i' } },
                                { slogan: { $regex: query, $options: 'i' } },
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

            // Statistiques générales pour les filtres
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