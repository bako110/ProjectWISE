const Agency = require('../models/agency');

class AgencyService {
    /**
     * 🔹 Récupérer toutes les agences avec pagination et filtres
     */
    async getAllAgencies({
        term,
        name = '',
        neighborhood = '',
        activityZone = '',
        sector = '',
        city = '',
        latitude = null,
        longitude = null,
        radius = 10,
        hasOwner = null,
        minGestionnaires = 0,
        page = 1,
        limit = 10,
        getAll = false,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    }) {
        try {
            const filter = {};

            // Filtre simple par term
            if (term) {
                filter.$or = [
                    { name: { $regex: term, $options: 'i' } },
                    { agencyDescription: { $regex: term, $options: 'i' } },
                    { slogan: { $regex: term, $options: 'i' } },
                ];
            }

            // Hiérarchie ville → secteur → quartier
            if (city) filter['address.city'] = { $regex: city, $options: 'i' };
            if (sector) filter['address.sector'] = { $regex: sector, $options: 'i' };
            if (neighborhood) filter['address.neighborhood'] = { $regex: neighborhood, $options: 'i' };

            // Conditions additionnelles sur name et activityZone
            const extraOrConditions = [];
            if (name) {
                extraOrConditions.push(
                    { name: { $regex: name, $options: 'i' } },
                    { agencyDescription: { $regex: name, $options: 'i' } },
                    { slogan: { $regex: name, $options: 'i' } }
                );
            }
            if (activityZone) {
                extraOrConditions.push({ zoneActivite: { $in: [new RegExp(activityZone, 'i')] } });
            }

            // Ajouter les conditions $or additionnelles
            if (extraOrConditions.length > 0) {
                if (filter.$or) {
                    filter.$or = [...filter.$or, ...extraOrConditions];
                } else {
                    filter.$or = extraOrConditions;
                }
            }

            // Filtres supplémentaires
            if (hasOwner !== null) {
                filter.owner = hasOwner ? { $exists: true, $ne: null } : { $exists: false };
            }
            
            if (minGestionnaires > 0) {
                filter.$expr = { $gte: [{ $size: { $ifNull: ['$gestionnaires', []] } }, minGestionnaires] };
            }

            // Construction de la requête
            let query = Agency.find(filter)
                .populate('owner', 'firstName lastName email phone')
                .populate('gestionnaires', 'firstName lastName email phone role')
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
            if (latitude && longitude) {
                agencies = agencies.filter(agency => {
                    if (!agency.address?.latitude || !agency.address?.longitude) return false;
                    const R = 6371; // Rayon de la Terre en km
                    const dLat = ((agency.address.latitude - latitude) * Math.PI) / 180;
                    const dLon = ((agency.address.longitude - longitude) * Math.PI) / 180;
                    const a =
                        Math.sin(dLat / 2) ** 2 +
                        Math.cos((latitude * Math.PI) / 180) *
                        Math.cos((agency.address.latitude * Math.PI) / 180) *
                        Math.sin(dLon / 2) ** 2;
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distance = R * c;
                    return distance <= radius;
                });
            }

            return {
                agencies,
                total,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('Erreur récupération agences:', error);
            throw error;
        }
    }

    /**
     * 🔹 Récupérer les zones d'activité d'une agence
     */
    async getAgencyZones(agencyId) {
        if (!agencyId) throw new Error('L\'identifiant de l\'agence est requis');

        const agency = await Agency.findById(agencyId).select('zoneActivite');
        if (!agency) throw new Error('Agence non trouvée');

        return agency.zoneActivite || [];
    }

    /**
     * 🔹 Récupérer une agence par ID
     */
    async getAgencyById(agencyId) {
        if (!agencyId) throw new Error("L'identifiant de l'agence est requis");

        const agency = await Agency.findById(agencyId)
            .populate('owner', 'firstName lastName email phone')
            .populate('gestionnaires', 'firstName lastName email phone role')
            .populate('client', 'firstName lastName email phone')
            .populate('collector', 'firstName lastName email phone');

        if (!agency) throw new Error('Agence non trouvée');

        return agency;
    }

    /**
     * 🔹 Mettre à jour une agence
     */
    async updateAgency(agencyId, updateData) {
        if (!agencyId) throw new Error("L'identifiant de l'agence est requis");

        const allowedFields = [
            'name',
            'agencyDescription',
            'zoneActivite',
            'slogan',
            'documents',
            'status',
            'location',
        ];

        const filteredUpdateData = {};
        Object.keys(updateData).forEach((key) => {
            if (allowedFields.includes(key)) {
                filteredUpdateData[key] = updateData[key];
            }
        });

        const agency = await Agency.findByIdAndUpdate(agencyId, filteredUpdateData, {
            new: true,
            runValidators: true,
        })
            .populate('owner', 'firstName lastName email phone')
            .populate('gestionnaires', 'firstName lastName email phone role');

        if (!agency) throw new Error('Agence non trouvée');

        return agency;
    }

    /**
     * 🔹 Supprimer une agence (soft delete)
     */
    async deleteAgency(agencyId) {
        if (!agencyId) throw new Error("L'identifiant de l'agence est requis");

        const agency = await Agency.findByIdAndUpdate(
            agencyId,
            {
                status: 'deleted',
                deletedAt: new Date(),
            },
            { new: true }
        );

        if (!agency) throw new Error('Agence non trouvée');

        return agency;
    }

    /**
     * 🔹 Récupérer les agences par statut
     */
    async getAgenciesByStatus(status) {
        if (!status) throw new Error('Le statut est requis');

        const agencies = await Agency.find({ status })
            .populate('owner', 'firstName lastName email phone')
            .populate('gestionnaires', 'firstName lastName email phone role')
            .sort({ createdAt: -1 });

        return agencies;
    }

    /**
     * 🔹 Ajouter ou mettre à jour les zones d'activité
     */
    async updateAgencyZone(agencyId, newZones) {
        if (!agencyId) throw new Error("L'identifiant de l'agence est requis");

        const agency = await Agency.findById(agencyId);
        if (!agency) throw new Error('Agence non trouvée');

        if (!Array.isArray(agency.zoneActivite)) {
            agency.zoneActivite = [];
        }

        // Empêcher les doublons
        agency.zoneActivite = [...new Set([...agency.zoneActivite, ...newZones])];

        await agency.save();
        return agency;
    }

    /**
     * 🔹 Supprimer certaines zones d'une agence
     */
    async removeAgencyZones(agencyId, zonesToRemove) {
        if (!agencyId) throw new Error("L'identifiant de l'agence est requis");
        if (!Array.isArray(zonesToRemove)) {
            throw new Error('zonesToRemove doit être un tableau');
        }

        const agency = await Agency.findById(agencyId);
        if (!agency) throw new Error('Agence non trouvée');

        if (!Array.isArray(agency.zoneActivite)) {
            agency.zoneActivite = [];
        }

        // Supprime les zones demandées
        agency.zoneActivite = agency.zoneActivite.filter(
            (zone) => !zonesToRemove.includes(zone)
        );

        await agency.save();
        return agency;
    }
}

module.exports = new AgencyService();