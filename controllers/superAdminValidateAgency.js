const AgencyValidationService = require('../services/superAdminValidateAgency');

class AgencyValidationController {
    
    /**
     * Valider une agence
     */
    async validateAgency(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de l\'agence requis'
                });
            }

            const result = await AgencyValidationService.validateAgency(id);

            res.status(200).json(result);

        } catch (error) {
            console.error('❌ Erreur validation agence:', error);
            
            res.status(500).json({
                success: false,
                message: error.message,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new AgencyValidationController();