const AgencyValidationService = require('../services/superAdminValidateAgency');
const {notificationService} = require('../services/notification.service.js');
const logger = require('../utils/logger');

class AgencyValidationController {

    /**
     * Modifier le statut d'une agence
     * Reçoit un paramètre query `action=activate|deactivate`
     */
    async validateAgency(req, res) {
        try {
            const { id } = req.params;
            const { action } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de l\'agence requis'
                });
            }

            if (!['activate', 'deactivate'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    message: 'Action invalide (utiliser activate ou deactivate)'
                });
            }

            const result = await AgencyValidationService.changeStatus(id, action);

            // const message = `L'agence ${result.name} a été ${action === 'activate' ? 'activée' : 'désactivée'} avec succès.`;

            // console.log('✅ Agence modifiée:', result);
            // await notificationService.createNotification({
            //     user: result.owner,
            //     message: message,
            //     type: 'AgencyAdd'
            // });

            res.status(200).json(result);

        } catch (error) {
            console.error('❌ Erreur modification agence:', error);
            res.status(500).json({
                success: false,
                message: error.message,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new AgencyValidationController();
