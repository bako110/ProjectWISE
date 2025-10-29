const Agency = require('../models/agency');

class AgencySearchService {
    // Recherche avancée d'agences
    async searchAgencies({
        search = '',
        city = '',
        neighborhood = '',
        zoneActivite = '',
        status = 'active',
        page = 1,
        limit = 10,
        getAll = false,
        coordinates = null,
        radius = 10 // rayon en kilomètres
    }) {
        try {
            const filter = {};

            // Filtre par statut (par défaut seulement les agences actives)
            if (status) {
                filter.status = status;
            }

            // Construction des conditions de recherche
            const searchConditions = [];

            // Recherche en plein texte
            if (search) {
                searchConditions.push(
                    { name: { $regex: search, $options: 'i' } },
                    { agencyDescription: { $regex: search, $options: 'i' } },
                    { slogan: { $regex: search, $options: 'i' } }
                );
            }

            // Filtre par ville
            if (city) {
                searchConditions.push({ 'address.city': { $regex: city, $options: 'i' } });
            }

            // Filtre par quartier
            if (neighborhood) {
                searchConditions.push({ 'address.neighborhood': { $regex: neighborhood, $options: 'i' } });
            }

            // Filtre par zone d'activité
            if (zoneActivite) {
                searchConditions.push({ zoneActivite: { $regex: zoneActivite, $options: 'i' } });
            }

            // Application des conditions de recherche
            if (searchConditions.length > 0) {
                filter.$or = searchConditions;
            }

            // Recherche géospatiale
            let geoQuery = Agency.find(filter);

            if (coordinates && coordinates.length === 2) {
                const [longitude, latitude] = coordinates;
                
                geoQuery = Agency.find({
                    ...filter,
                    'location.coordinates': {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [longitude, latitude]
                            },
                            $maxDistance: radius * 1000 // Conversion en mètres
                        }
                    }
                });
            }

            // Population des relations
            let query = geoQuery
                .populate('owner', 'firstName lastName email phone')
                .populate('gestionnaires', 'firstName lastName email phone role')
                .populate('client', 'firstName lastName email phone')
                .populate('collector', 'firstName lastName email phone')
                .sort({ createdAt: -1 });

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
                }
            };

        } catch (error) {
            throw new Error(`Erreur lors de la recherche d'agences: ${error.message}`);
        }
    }

    // Recherche en plein texte avec scoring de pertinence
    async fullTextSearch({
        query = '',
        city = '',
        neighborhood = '',
        zoneActivite = '',
        status = 'active',
        page = 1,
        limit = 10
    }) {
        try {
            const searchPipeline = [];

            // Étape de recherche en texte intégral
            if (query) {
                searchPipeline.push({
                    $match: {
                        $text: { $search: query },
                        status: status
                    }
                });

                // Ajout du score de pertinence
                searchPipeline.push({
                    $addFields: {
                        score: { $meta: "textScore" }
                    }
                });
            } else {
                searchPipeline.push({
                    $match: { status: status }
                });
            }

            // Filtres supplémentaires
            const matchStage = { status: status };

            if (city) {
                matchStage['address.city'] = { $regex: city, $options: 'i' };
            }

            if (neighborhood) {
                matchStage['address.neighborhood'] = { $regex: neighborhood, $options: 'i' };
            }

            if (zoneActivite) {
                matchStage.zoneActivite = { $regex: zoneActivite, $options: 'i' };
            }

            if (Object.keys(matchStage).length > 1) { // Plus que juste le statut
                searchPipeline.push({
                    $match: matchStage
                });
            }

            // Tri par score de pertinence ou par date
            if (query) {
                searchPipeline.push({
                    $sort: { score: -1, createdAt: -1 }
                });
            } else {
                searchPipeline.push({
                    $sort: { createdAt: -1 }
                });
            }

            // Pagination
            searchPipeline.push(
                { $skip: (page - 1) * limit },
                { $limit: parseInt(limit) }
            );

            // Population des relations
            searchPipeline.push(
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

            const agencies = await Agency.aggregate(searchPipeline);

            // Comptage total pour la pagination
            const countPipeline = [...searchPipeline];
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
                }
            };

        } catch (error) {
            throw new Error(`Erreur lors de la recherche en plein texte: ${error.message}`);
        }
    }

    // Recherche géospatiale avancée
    async geoSearch({
        latitude,
        longitude,
        radius = 10, // en kilomètres
        search = '',
        city = '',
        neighborhood = '',
        status = 'active',
        page = 1,
        limit = 10
    }) {
        try {
            if (!latitude || !longitude) {
                throw new Error('Les coordonnées géographiques sont requises');
            }

            const filter = {
                status: status,
                'location.coordinates': {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(longitude), parseFloat(latitude)]
                        },
                        $maxDistance: radius * 1000 // Conversion en mètres
                    }
                }
            };

            // Filtres supplémentaires
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { agencyDescription: { $regex: search, $options: 'i' } },
                    { slogan: { $regex: search, $options: 'i' } }
                ];
            }

            if (city) {
                filter['address.city'] = { $regex: city, $options: 'i' };
            }

            if (neighborhood) {
                filter['address.neighborhood'] = { $regex: neighborhood, $options: 'i' };
            }

            const agencies = await Agency.find(filter)
                .populate('owner', 'firstName lastName email phone')
                .populate('gestionnaires', 'firstName lastName email phone role')
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

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
                }
            };

        } catch (error) {
            throw new Error(`Erreur lors de la recherche géospatiale: ${error.message}`);
        }
    }

    // Recherche par filtres multiples
    async searchByMultipleFilters(filters = {}) {
        try {
            const {
                search = '',
                city = '',
                neighborhood = '',
                zoneActivite = '',
                status = 'active',
                hasOwner = false,
                minGestionnaires = 0,
                page = 1,
                limit = 10,
                getAll = false
            } = filters;

            const filter = { status };

            // Construction dynamique des conditions de recherche
            const conditions = [];

            if (search) {
                conditions.push(
                    { name: { $regex: search, $options: 'i' } },
                    { agencyDescription: { $regex: search, $options: 'i' } },
                    { slogan: { $regex: search, $options: 'i' } }
                );
            }

            if (city) {
                conditions.push({ 'address.city': { $regex: city, $options: 'i' } });
            }

            if (neighborhood) {
                conditions.push({ 'address.neighborhood': { $regex: neighborhood, $options: 'i' } });
            }

            if (zoneActivite) {
                conditions.push({ zoneActivite: { $regex: zoneActivite, $options: 'i' } });
            }

            if (conditions.length > 0) {
                filter.$or = conditions;
            }

            // Filtres supplémentaires
            if (hasOwner) {
                filter.owner = { $exists: true, $ne: null };
            }

            if (minGestionnaires > 0) {
                filter.$expr = { $gte: [{ $size: '$gestionnaires' }, parseInt(minGestionnaires)] };
            }

            let query = Agency.find(filter)
                .populate('owner', 'firstName lastName email phone')
                .populate('gestionnaires', 'firstName lastName email phone role')
                .sort({ createdAt: -1 });

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
                }
            };

        } catch (error) {
            throw new Error(`Erreur lors de la recherche par filtres multiples: ${error.message}`);
        }
    }

    // Récupérer les suggestions de recherche
    async getSearchSuggestions(query = '') {
        try {
            if (!query || query.length < 2) {
                return {
                    success: true,
                    suggestions: []
                };
            }

            const suggestions = await Agency.aggregate([
                {
                    $match: {
                        status: 'active',
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { 'address.city': { $regex: query, $options: 'i' } },
                            { 'address.neighborhood': { $regex: query, $options: 'i' } },
                            { zoneActivite: { $regex: query, $options: 'i' } }
                        ]
                    }
                },
                {
                    $project: {
                        name: 1,
                        city: '$address.city',
                        neighborhood: '$address.neighborhood',
                        zoneActivite: 1,
                        type: {
                            $cond: {
                                if: { $regexMatch: { input: '$name', regex: query, options: 'i' } },
                                then: 'name',
                                else: {
                                    $cond: {
                                        if: { $regexMatch: { input: '$address.city', regex: query, options: 'i' } },
                                        then: 'city',
                                        else: {
                                            $cond: {
                                                if: { $regexMatch: { input: '$address.neighborhood', regex: query, options: 'i' } },
                                                then: 'neighborhood',
                                                else: 'zoneActivite'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                { $limit: 10 }
            ]);

            return {
                success: true,
                suggestions
            };

        } catch (error) {
            throw new Error(`Erreur lors de la récupération des suggestions: ${error.message}`);
        }
    }
}

module.exports = new AgencySearchService ();