const Agence = require('../models/agency');

class AgencySearchService {
    // RECHERCHE UNIFIÉE OPTIMISÉE
    async unifiedSearch({
        // Critères de recherche de base
        searchTerm = '',
        name = '',
        neighborhood = '',
        activityZone = '',
        sector = '',
        arrondissement = '',
        city = '',
        
        // Filtres avancés
        status = 'active',
        hasOwner = null,
        hasGestionnaires = null,
        minGestionnaires = 0,
        maxGestionnaires = null,
        
        // Recherche géospatiale
        latitude = null,
        longitude = null,
        radius = 10, // rayon en kilomètres
        
        // Pagination et tri
        page = 1,
        limit = 10,
        getAll = false,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    }) {
        try {
            // Construction du filtre principal
            const filter = this.buildMainFilter({
                searchTerm, name, neighborhood, activityZone, 
                sector, arrondissement, city, status
            });

            // Application des filtres supplémentaires
            this.applyAdditionalFilters(filter, {
                hasOwner, hasGestionnaires, minGestionnaires, maxGestionnaires
            });

            // Construction de la requête de base
            let query = Agence.find(filter);

            // Gestion de la recherche géospatiale
            if (this.isValidGeoSearch(latitude, longitude)) {
                query = this.applyGeoSearch(query, latitude, longitude, radius);
            }

            // Configuration du tri
            const sortOptions = this.buildSortOptions(sortBy, sortOrder, searchTerm);
            query = query.sort(sortOptions);

            // Population des relations
            query = this.populateRelations(query);

            // Exécution de la requête
            if (getAll === 'true' || getAll === true) {
                return await this.executeGetAllSearch(query, filter, {
                    searchTerm, name, neighborhood, activityZone, sector, 
                    arrondissement, city, latitude, longitude, radius, 
                    status, hasOwner, minGestionnaires
                });
            }

            return await this.executePaginatedSearch(query, filter, page, limit, {
                searchTerm, name, neighborhood, activityZone, sector, 
                arrondissement, city, latitude, longitude, radius, 
                status, hasOwner, minGestionnaires
            });

        } catch (error) {
            throw new Error(`Erreur lors de la recherche unifiée d'agences: ${error.message}`);
        }
    }

    // RECHERCHE AVANCÉE AVEC SCORING
    async advancedSearch({
        searchTerm = '',
        filters = {},
        location = null,
        options = {}
    }) {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = 'relevance',
                includeInactive = false
            } = options;

            // Construction du pipeline d'agrégation
            const pipeline = this.buildAggregationPipeline({
                searchTerm,
                filters,
                location,
                includeInactive,
                sortBy,
                page,
                limit
            });

            // Exécution de l'agrégation
            const [agencies, countResult] = await Promise.all([
                Agence.aggregate(pipeline),
                this.getTotalCount(pipeline, page, limit)
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
                searchSummary: this.buildSearchSummary(searchTerm, filters, location, sortBy)
            };

        } catch (error) {
            throw new Error(`Erreur lors de la recherche avancée: ${error.message}`);
        }
    }

    // MÉTHODES UTILITAIRES PRIVÉES

    buildMainFilter({
        searchTerm, name, neighborhood, activityZone, 
        sector, arrondissement, city, status
    }) {
        const filter = {};

        // Filtre par statut
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Si terme de recherche général fourni
        if (searchTerm) {
            filter.$or = this.buildSearchConditions(searchTerm);
            return filter;
        }

        // Recherche par champs spécifiques
        const fieldConditions = [];

        if (name) fieldConditions.push({ name: { $regex: name, $options: 'i' } });
        if (neighborhood) fieldConditions.push({ 'address.neighborhood': { $regex: neighborhood, $options: 'i' } });
        if (activityZone) fieldConditions.push({ zoneActivite: { $regex: activityZone, $options: 'i' } });
        if (sector) fieldConditions.push({ 'address.sector': { $regex: sector, $options: 'i' } });
        if (arrondissement) fieldConditions.push({ 'address.arrondissement': { $regex: arrondissement, $options: 'i' } });
        if (city) fieldConditions.push({ 'address.city': { $regex: city, $options: 'i' } });

        if (fieldConditions.length > 0) {
            filter.$or = fieldConditions;
        }

        return filter;
    }

    buildSearchConditions(searchTerm) {
        return [
            { name: { $regex: searchTerm, $options: 'i' } },
            { agencyDescription: { $regex: searchTerm, $options: 'i' } },
            { slogan: { $regex: searchTerm, $options: 'i' } },
            { 'address.neighborhood': { $regex: searchTerm, $options: 'i' } },
            { 'address.city': { $regex: searchTerm, $options: 'i' } },
            { zoneActivite: { $regex: searchTerm, $options: 'i' } },
            { 'address.sector': { $regex: searchTerm, $options: 'i' } },
            { 'address.arrondissement': { $regex: searchTerm, $options: 'i' } }
        ];
    }

    applyAdditionalFilters(filter, {
        hasOwner, hasGestionnaires, minGestionnaires, maxGestionnaires
    }) {
        if (hasOwner !== null) {
            filter.owner = hasOwner ? { $exists: true, $ne: null } : { $exists: false };
        }

        if (hasGestionnaires !== null) {
            if (hasGestionnaires) {
                filter.gestionnaires = { $exists: true, $ne: [] };
            } else {
                filter.gestionnaires = { $exists: true, $eq: [] };
            }
        }

        // Filtre sur le nombre de gestionnaires
        const gestionnaireConditions = [];
        if (minGestionnaires > 0) {
            gestionnaireConditions.push({ 
                $expr: { 
                    $gte: [{ $size: { $ifNull: ['$gestionnaires', []] } }, parseInt(minGestionnaires)] 
                } 
            });
        }
        if (maxGestionnaires !== null && maxGestionnaires > 0) {
            gestionnaireConditions.push({ 
                $expr: { 
                    $lte: [{ $size: { $ifNull: ['$gestionnaires', []] } }, parseInt(maxGestionnaires)] 
                } 
            });
        }

        if (gestionnaireConditions.length > 0) {
            if (gestionnaireConditions.length === 1) {
                Object.assign(filter, gestionnaireConditions[0]);
            } else {
                filter.$and = gestionnaireConditions;
            }
        }
    }

    isValidGeoSearch(latitude, longitude) {
        return latitude && longitude && 
               !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));
    }

    applyGeoSearch(query, latitude, longitude, radius) {
        // Utilisation de l'index géospatial si vous activez la structure GeoJSON
        // Pour l'instant, utilisation de la méthode de calcul de distance
        return Agence.find({
            ...query.getFilter(),
            'address.latitude': { $exists: true, $ne: null },
            'address.longitude': { $exists: true, $ne: null }
        }).where('address.latitude').ne(null)
          .where('address.longitude').ne(null)
          .where(() => {
            // Le filtrage par distance se fera en post-traitement
            // ou via aggregation pipeline pour de meilleures performances
            return true;
          });
    }

    buildSortOptions(sortBy, sortOrder, searchTerm) {
        const sortOptions = {};
        
        // Priorité au score de pertinence si recherche par terme
        if (searchTerm && sortBy === 'relevance') {
            // Le scoring sera géré dans l'aggregation pipeline
            sortOptions.score = { $meta: "textScore" };
        } else {
            const order = sortOrder === 'desc' ? -1 : 1;
            
            switch(sortBy) {
                case 'name':
                    sortOptions.name = order;
                    break;
                case 'city':
                    sortOptions['address.city'] = order;
                    break;
                case 'neighborhood':
                    sortOptions['address.neighborhood'] = order;
                    break;
                case 'createdAt':
                default:
                    sortOptions.createdAt = order;
            }
        }
        
        return sortOptions;
    }

    populateRelations(query) {
        return query
            .populate('owner', 'firstName lastName email phone')
            .populate('gestionnaires', 'firstName lastName email phone role')
            .populate('client', 'firstName lastName email phone')
            .populate('collector', 'firstName lastName email phone');
    }

    async executeGetAllSearch(query, filter, searchCriteria) {
        const agencies = await query;
        const total = await Agence.countDocuments(filter);
        
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
            searchCriteria
        };
    }

    async executePaginatedSearch(query, filter, page, limit, searchCriteria) {
        const agencies = await query
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Agence.countDocuments(filter);

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
            searchCriteria
        };
    }

    buildAggregationPipeline({ searchTerm, filters, location, includeInactive, sortBy, page, limit }) {
        const pipeline = [];
        const matchStage = {};

        // Filtre de statut
        if (!includeInactive) {
            matchStage.status = filters.status || 'active';
        }

        // Application des filtres détaillés
        const detailedFilters = this.buildDetailedFilters(filters);
        if (detailedFilters.length > 0) {
            matchStage.$or = detailedFilters;
        }

        // Recherche par terme avec scoring
        if (searchTerm) {
            pipeline.push({
                $match: {
                    ...matchStage,
                    $or: this.buildSearchConditions(searchTerm)
                }
            });

            // Scoring de pertinence
            pipeline.push({
                $addFields: {
                    relevanceScore: this.buildRelevanceScore(searchTerm)
                }
            });
        } else if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Recherche géospatiale
        if (location && this.isValidGeoSearch(location.latitude, location.longitude)) {
            pipeline.push(...this.buildGeoStages(location));
        }

        // Tri
        pipeline.push({ $sort: this.buildAggregationSort(sortBy, searchTerm, location) });

        // Pagination
        pipeline.push(
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        );

        // Population des relations
        pipeline.push(...this.buildLookupStages());

        return pipeline;
    }

    buildDetailedFilters(filters) {
        const conditions = [];
        const fields = ['name', 'neighborhood', 'activityZone', 'sector', 'arrondissement', 'city'];

        fields.forEach(field => {
            if (filters[field]) {
                const dbField = field === 'activityZone' ? 'zoneActivite' : 
                              field === 'neighborhood' ? 'address.neighborhood' :
                              field === 'sector' ? 'address.sector' :
                              field === 'arrondissement' ? 'address.arrondissement' :
                              field === 'city' ? 'address.city' : field;
                
                conditions.push({ [dbField]: { $regex: filters[field], $options: 'i' } });
            }
        });

        return conditions;
    }

    buildRelevanceScore(searchTerm) {
        return {
            $add: [
                {
                    $cond: [
                        { $regexMatch: { input: '$name', regex: searchTerm, options: 'i' } },
                        3, // Score élevé pour le nom
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
        };
    }

    buildGeoStages(location) {
        return [
            {
                $addFields: {
                    distance: {
                        $let: {
                            vars: {
                                rad: Math.PI / 180,
                                lat1: location.latitude * Math.PI / 180,
                                lat2: { $multiply: ['$address.latitude', Math.PI / 180] },
                                deltaLat: { $multiply: [{ $subtract: ['$address.latitude', location.latitude] }, Math.PI / 180] },
                                deltaLon: { $multiply: [{ $subtract: ['$address.longitude', location.longitude] }, Math.PI / 180] }
                            },
                            in: {
                                $multiply: [
                                    6371,
                                    {
                                        $acos: {
                                            $add: [
                                                { $multiply: [{ $cos: '$$lat1' }, { $cos: '$$lat2' }, { $cos: '$$deltaLon' }] },
                                                { $multiply: [{ $sin: '$$lat1' }, { $sin: '$$lat2' }] }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    'address.latitude': { $exists: true, $ne: null },
                    'address.longitude': { $exists: true, $ne: null },
                    distance: { $lte: location.radius || 10 }
                }
            }
        ];
    }

    buildAggregationSort(sortBy, searchTerm, location) {
        const sortStage = {};
        
        if (searchTerm && sortBy === 'relevance') {
            sortStage.relevanceScore = -1;
        } else if (sortBy === 'distance' && location) {
            sortStage.distance = 1;
        } else if (sortBy === 'name') {
            sortStage.name = 1;
        } else if (sortBy === 'createdAt') {
            sortStage.createdAt = -1;
        } else {
            sortStage.createdAt = -1;
        }
        
        return sortStage;
    }

    buildLookupStages() {
        return [
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'owner'
                }
            },
            { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
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
            { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'collector',
                    foreignField: '_id',
                    as: 'collector'
                }
            },
            { $unwind: { path: '$collector', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    'owner.password': 0,
                    'gestionnaires.password': 0,
                    'client.password': 0,
                    'collector.password': 0
                }
            }
        ];
    }

    async getTotalCount(pipeline, page, limit) {
        const countPipeline = [
            ...pipeline.slice(0, -8), // Retirer pagination et population
            { $count: 'total' }
        ];
        return await Agence.aggregate(countPipeline);
    }

    buildSearchSummary(searchTerm, filters, location, sortBy) {
        return {
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
            hasLocation: !!(location && location.latitude),
            sortBy
        };
    }

    // MÉTHODES DE MÉTADONNÉES (inchangées mais optimisables)
    async getSearchMetadata(query = '') {
        try {
            const metadata = {};

            if (query && query.length >= 2) {
                const suggestions = await Agence.aggregate(this.buildSuggestionPipeline(query));
                metadata.suggestions = suggestions;
            }

            const stats = await Agence.aggregate([{ $facet: this.buildStatsFacet() }]);
            metadata.filters = stats[0];

            return { success: true, metadata };

        } catch (error) {
            throw new Error(`Erreur lors de la récupération des métadonnées: ${error.message}`);
        }
    }

    buildSuggestionPipeline(query) {
        return [
            {
                $match: {
                    $or: this.buildSearchConditions(query)
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
        ];
    }

    buildStatsFacet() {
        return {
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
        };
    }
}

module.exports = new AgencySearchService();