const Agency = require('../models/agency');

class AgencyValidationService {
    
    /**
     * Valider une agence (changer le statut de inactive à active)
     */
    async validateAgency(agencyId) {
        try {
            // Vérifier que l'agence existe
            const agency = await Agency.findById(agencyId);
            
            if (!agency) {
                throw new Error('Agence non trouvée');
            }
            
            // Vérifier que l'agence n'est pas déjà active
            if (agency.status === 'active') {
                throw new Error('Cette agence est déjà active');
            }
            
            // Vérifier que l'agence n'est pas supprimée
            if (agency.status === 'deleted') {
                throw new Error('Impossible de valider une agence supprimée');
            }
            
            // Mettre à jour l'agence
            const validatedAgency = await Agency.findByIdAndUpdate(
                agencyId,
                {
                    status: 'active',
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            ).populate('owner', 'firstName lastName email phone');
            
            return {
                success: true,
                message: 'Agence validée avec succès',
                data: validatedAgency
            };
            
        } catch (error) {
            console.error('Erreur validation agence:', error);
            throw new Error(`Erreur lors de la validation: ${error.message}`);
        }
    }
}

module.exports = new AgencyValidationService();