const Agency = require('../models/agency');
const User = require('../models/User');

class AgencySearchService {
    // Recherche unifiée détaillée - COMPLÈTEMENT RECODÉE
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
            // ÉTAPE 1: Construire le pipeline d'agrégation
            const pipeline = [];
            
            // Match initial sur les champs Agency
            const agencyMatch = {};
            
            // Filtre par statut
            if (status && status !== 'all') {
                agencyMatch.status = status;
            }
            
            // Conditions de recherche dans Agency
            const agencyConditions = [];
            
            if (name) {
                agencyConditions.push(
                    { name: { $regex: name, $options: 'i' } },
                    { agencyDescription: { $regex: name, $options: 'i' } },
                    { slogan: { $regex: name, $options: 'i' } }
                );
            }
            
            if (activityZone) {
                agencyConditions.push({
                    zoneActivite: { $regex: activityZone, $options: 'i' }
                });
            }
            
            if (agencyConditions.length > 0) {
                agencyMatch.$or = agencyConditions;
            }
            
            // Filtres supplémentaires Agency
            if (hasOwner !== null) {
                if (hasOwner === true || hasOwner === 'true') {
                    agencyMatch.owner = { $exists: true, $ne: null };
                } else {
                    agencyMatch.owner = { $exists: false };
                }
            }
            
            if (minGestionnaires > 0) {
                agencyMatch.$expr = {
                    $gte: [{ $size: { $ifNull: ['$gestionnaires', []] } }, parseInt(minGestionnaires)]
                };
            }
            
            pipeline.push({ $match: agencyMatch });
            
            // ÉTAPE 2: Lookup des données User pour owner et gestionnaires
            pipeline.push(
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'ownerData'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'gestionnaires',
                        foreignField: '_id',
                        as: 'gestionnairesData'
                    }
                },
                {
                    $unwind: {
                        path: '$ownerData',
                        preserveNullAndEmptyArrays: true
                    }
                }
            );
            
            // ÉTAPE 3: Filtrer par critères d'adresse (dans les Users)
            const addressConditions = [];
            
            // Construction des conditions d'adresse
            if (neighborhood) {
                addressConditions.push(
                    { 'ownerData.address.neighborhood': { $regex: neighborhood, $options: 'i' } }
                );
                // Pour les gestionnaires, on vérifie si au moins un a le quartier recherché
                addressConditions.push({
                    'gestionnairesData': {
                        $elemMatch: {
                            'address.neighborhood': { $regex: neighborhood, $options: 'i' }
                        }
                    }
                });
            }
            
            if (sector) {
                addressConditions.push(
                    { 'ownerData.address.sector': { $regex: sector, $options: 'i' } }
                );
                addressConditions.push({
                    'gestionnairesData': {
                        $elemMatch: {
                            'address.sector': { $regex: sector, $options: 'i' }
                        }
                    }
                });
            }
            
            if (arrondissement) {
                addressConditions.push(
                    { 'ownerData.address.arrondissement': { $regex: arrondissement, $options: 'i' } }
                );
                addressConditions.push({
                    'gestionnairesData': {
                        $elemMatch: {
                            'address.arrondissement': { $regex: arrondissement, $options: 'i' }
                        }
                    }
                });
            }
            
            if (city) {
                addressConditions.push(
                    { 'ownerData.address.city': { $regex: city, $options: 'i' } }
                );
                addressConditions.push({
                    'gestionnairesData': {
                        $elemMatch: {
                            'address.city': { $regex: city, $options: 'i' }
                        }
                    }
                });
            }
            
            // Recherche géospatiale (via les Users)
            if (latitude && longitude) {
                const earthRadiusKm = 6371;
                const maxDistance = radius / earthRadiusKm;
                
                addressConditions.push({
                    $or: [
                        {
                            $and: [
                                { 'ownerData.address.latitude': { $exists: true, $ne: null } },
                                { 'ownerData.address.longitude': { $exists: true, $ne: null } },
                                {
                                    $expr: {
                                        $let: {
                                            vars: {
                                                lat1: { $degreesToRadians: parseFloat(latitude) },
                                                lon1: { $degreesToRadians: parseFloat(longitude) },
                                                lat2: { $degreesToRadians: '$ownerData.address.latitude' },
                                                lon2: { $degreesToRadians: '$ownerData.address.longitude' },
                                                dLat: { $subtract: ['$lat2', '$lat1'] },
                                                dLon: { $subtract: ['$lon2', '$lon1'] },
                                                a: {
                                                    $add: [
                                                        { $multiply: [{ $sin: { $divide: ['$dLat', 2] } }, { $sin: { $divide: ['$dLat', 2] } }] },
                                                        {
                                                            $multiply: [
                                                                { $multiply: [{ $cos: '$lat1' }, { $cos: '$lat2' }] },
                                                                { $multiply: [{ $sin: { $divide: ['$dLon', 2] } }, { $sin: { $divide: ['$dLon', 2] } }] }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                c: { $multiply: [2, { $atan2: [{ $sqrt: '$a' }, { $sqrt: { $subtract: [1, '$a'] } }] }] },
                                                distance: { $multiply: [earthRadiusKm, '$c'] }
                                            },
                                            in: { $lte: ['$distance', radius] }
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            'gestionnairesData': {
                                $elemMatch: {
                                    'address.latitude': { $exists: true, $ne: null },
                                    'address.longitude': { $exists: true, $ne: null },
                                    $expr: {
                                        $let: {
                                            vars: {
                                                lat1: { $degreesToRadians: parseFloat(latitude) },
                                                lon1: { $degreesToRadians: parseFloat(longitude) },
                                                lat2: { $degreesToRadians: '$$this.address.latitude' },
                                                lon2: { $degreesToRadians: '$$this.address.longitude' },
                                                dLat: { $subtract: ['$lat2', '$lat1'] },
                                                dLon: { $subtract: ['$lon2', '$lon1'] },
                                                a: {
                                                    $add: [
                                                        { $multiply: [{ $sin: { $divide: ['$dLat', 2] } }, { $sin: { $divide: ['$dLat', 2] } }] },
                                                        {
                                                            $multiply: [
                                                                { $multiply: [{ $cos: '$lat1' }, { $cos: '$lat2' }] },
                                                                { $multiply: [{ $sin: { $divide: ['$dLon', 2] } }, { $sin: { $divide: ['$dLon', 2] } }] }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                c: { $multiply: [2, { $atan2: [{ $sqrt: '$a' }, { $sqrt: { $subtract: [1, '$a'] } }] }] },
                                                distance: { $multiply: [earthRadiusKm, '$c'] }
                                            },
                                            in: { $lte: ['$distance', radius] }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                });
            }
            
            // Appliquer les filtres d'adresse si nécessaire
            if (addressConditions.length > 0) {
                pipeline.push({
                    $match: {
                        $or: addressConditions
                    }
                });
            }
            
            // ÉTAPE 4: Projection pour formater la réponse
            pipeline.push({
                $project: {
                    // Champs Agency de base
                    name: 1,
                    agencyDescription: 1,
                    zoneActivite: 1,
                    slogan: 1,
                    status: 1,
                    documents: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    
                    // Owner avec données complètes (sans password)
                    owner: {
                        $cond: {
                            if: { $ne: ['$ownerData', null] },
                            then: {
                                _id: '$ownerData._id',
                                firstName: '$ownerData.firstName',
                                lastName: '$ownerData.lastName',
                                email: '$ownerData.email',
                                phone: '$ownerData.phone',
                                address: '$ownerData.address'
                            },
                            else: null
                        }
                    },
                    
                    // Gestionnaires avec données complètes
                    gestionnaires: {
                        $map: {
                            input: '$gestionnairesData',
                            as: 'gestionnaire',
                            in: {
                                _id: '$$gestionnaire._id',
                                firstName: '$$gestionnaire.firstName',
                                lastName: '$$gestionnaire.lastName',
                                email: '$$gestionnaire.email',
                                phone: '$$gestionnaire.phone',
                                address: '$$gestionnaire.address'
                            }
                        }
                    },
                    
                    // Références originales
                    client: 1,
                    collector: 1,
                    deletedate: 1
                }
            });
            
            // ÉTAPE 5: Tri
            const sortStage = {};
            sortStage[sortBy] = sortOrder === 'desc' ? -1 : 1;
            pipeline.push({ $sort: sortStage });
            
            // ÉTAPE 6: Pagination
            const countPipeline = [...pipeline];
            countPipeline.push({ $count: 'total' });
            
            if (!getAll) {
                pipeline.push(
                    { $skip: (page - 1) * limit },
                    { $limit: parseInt(limit) }
                );
            }
            
            // ÉTAPE 7: Exécution
            const [agencies, totalResult] = await Promise.all([
                Agency.aggregate(pipeline),
                Agency.aggregate(countPipeline)
            ]);
            
            const total = totalResult.length > 0 ? totalResult[0].total : 0;
            
            // Population des références client et collector
            const populatedAgencies = await Agency.populate(agencies, [
                {
                    path: 'client',
                    select: 'firstName lastName email phone address',
                    model: 'User'
                },
                {
                    path: 'collector', 
                    select: 'firstName lastName email phone address',
                    model: 'User'
                }
            ]);
            
            return {
                success: true,
                data: populatedAgencies,
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
            console.error('Erreur détaillée recherche agences:', error);
            throw new Error(`Erreur lors de la recherche unifiée d'agences: ${error.message}`);
        }
    }

    // Les autres méthodes (advancedSearch, getSearchMetadata) restent similaires
    // mais doivent être adaptées avec la même logique de lookup

    async advancedSearch({
        searchTerm = '',
        filters = {},
        location = null,
        options = {}
    }) {
        try {
            // Implémentation simplifiée utilisant unifiedSearch
            const result = await this.unifiedSearch({
                name: filters.name || '',
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
                    hasLocation: !!(location && location.latitude),
                    sortBy: options.sortBy || 'relevance'
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

            // Suggestions basées sur les noms d'agences et zones d'activité
            if (query && query.length >= 2) {
                const suggestions = await Agency.aggregate([
                    {
                        $match: {
                            $or: [
                                { name: { $regex: query, $options: 'i' } },
                                { agencyDescription: { $regex: query, $options: 'i' } },
                                { slogan: { $regex: query, $options: 'i' } },
                                { zoneActivite: { $regex: query, $options: 'i' } }
                            ]
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            type: 'agency'
                        }
                    },
                    { $limit: 10 }
                ]);
                
                metadata.suggestions = suggestions;
            }

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