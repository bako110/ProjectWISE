const Agency = require('../models/agency');

class AgencyService {
    // Récupérer toutes les agences avec pagination et filtres
    async getAllAgencies({ status, search, page = 1, limit = 10 }) {
        const filter = {};
        
        if (status) {
            filter.status = status;
        }

        let result;
        if (search) {
            const searchFilter = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { agencyDescription: { $regex: search, $options: 'i' } },
                    { slogan: { $regex: search, $options: 'i' } }
                ]
            };
            Object.assign(filter, searchFilter);
        }

        const agencies = await Agency.find(filter)
            .populate('owner', 'firstName lastName email phone')
            .populate('gestionnaires', 'firstName lastName email phone role')
            .populate('client', 'firstName lastName email phone')
            .populate('collector', 'firstName lastName email phone')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Agency.countDocuments(filter);

        return {
            agencies,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Récupérer une agence par ID
    async getAgencyById(agencyId) {
        if (!agencyId) {
            throw new Error('L\'identifiant de l\'agence est requis');
        }

        const agency = await Agency.findById(agencyId)
            .populate('owner', 'firstName lastName email phone')
            .populate('gestionnaires', 'firstName lastName email phone role')
            .populate('client', 'firstName lastName email phone')
            .populate('collector', 'firstName lastName email phone');
        
        if (!agency) {
            throw new Error('Agence non trouvée');
        }
        return agency;
    }

    // Mettre à jour une agence
    async updateAgency(agencyId, updateData) {
        if (!agencyId) {
            throw new Error('L\'identifiant de l\'agence est requis');
        }

        const allowedFields = ['name', 'agencyDescription', 'zoneActivite', 'slogan', 'documents', 'status', 'location'];
        const filteredUpdateData = {};
        
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdateData[key] = updateData[key];
            }
        });

        const agency = await Agency.findByIdAndUpdate(
            agencyId, 
            filteredUpdateData, 
            { new: true, runValidators: true }
        )
        .populate('owner', 'firstName lastName email phone')
        .populate('gestionnaires', 'firstName lastName email phone role');
        
        if (!agency) {
            throw new Error('Agence non trouvée');
        }
        return agency;
    }

    // Supprimer une agence (soft delete)
    async deleteAgency(agencyId) {
        if (!agencyId) {
            throw new Error('L\'identifiant de l\'agence est requis');
        }

        const agency = await Agency.findByIdAndUpdate(
            agencyId,
            { 
                status: 'deleted',
                deletedate: new Date()
            },
            { new: true }
        );
        
        if (!agency) {
            throw new Error('Agence non trouvée');
        }
        return agency;
    }

    // Récupérer les agences par statut
    async getAgenciesByStatus(status) {
        if (!status) {
            throw new Error('Le statut est requis');
        }

        const agencies = await Agency.find({ status })
            .populate('owner', 'firstName lastName email phone')
            .populate('gestionnaires', 'firstName lastName email phone role')
            .sort({ createdAt: -1 });
        return agencies;
    }

    async updateAgencyZone(agencyId, newZones) {
        const agency = await Agency.findById(agencyId);
        if (!agency) {
            throw new Error('Agence non trouvée');
        }

        // Si zoneActivite est un tableau, on ajoute sans remplacer
        if (!Array.isArray(agency.zoneActivite)) {
            agency.zoneActivite = [];
        }

        // Ajoute les nouveaux éléments sans doublons (facultatif)
        agency.zoneActivite = [...new Set([...agency.zoneActivite, ...newZones])];

        await agency.save();
        return agency;
    }

}

module.exports = new AgencyService();