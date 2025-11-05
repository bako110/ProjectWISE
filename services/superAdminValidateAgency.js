const Agency = require('../models/agency');

class AgencyValidationService {
    
    /**
     * Changer le statut d'une agence
     * @param {String} agencyId - ID de l'agence
     * @param {String} action - 'activate' ou 'deactivate'
     */
    async changeStatus(agencyId, action) {
        try {
            const agency = await Agency.findById(agencyId);
            
            if (!agency) {
                throw new Error('Agence non trouvée');
            }

            if (agency.status === 'deleted') {
                throw new Error('Impossible de modifier une agence supprimée');
            }

            if (action === 'activate' && agency.status === 'active') {
                throw new Error('Cette agence est déjà active');
            }

            if (action === 'deactivate' && agency.status === 'inactive') {
                throw new Error('Cette agence est déjà inactive');
            }

            const newStatus = action === 'activate' ? 'active' : 'inactive';

            const updatedAgency = await Agency.findByIdAndUpdate(
                agencyId,
                { status: newStatus, updatedAt: new Date() },
                { new: true, runValidators: true }
            ).populate('owner', 'firstName lastName email phone');

            return {
                success: true,
                message: `Agence ${newStatus} avec succès`,
                data: updatedAgency
            };

        } catch (error) {
            console.error('Erreur modification agence:', error);
            throw new Error(`Erreur lors de la modification: ${error.message}`);
        }
    }
}

module.exports = new AgencyValidationService();
