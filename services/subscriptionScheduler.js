const cron = require('node-cron');
const Subscription = require('../models/subscription.js');
const Passage = require('../models/Passage.js');
const Notification = require('../models/Notification.js');
const User = require('../models/User.js');
const logger = require('../utils/logger.js');

/**
 * Vérifie chaque jour à minuit les abonnements expirés et les annule
 */
const scheduleSubscriptionCancellation = () => {
    // Cron pattern: '0 0 * * *' => tous les jours à minuit
    cron.schedule('0 0 * * *', async () => {
        try {
            const now = new Date();
            const expiredSubscriptions = await Subscription.find({ isActive: true, endDate: { $lte: now } });

            for (const sub of expiredSubscriptions) {
                sub.isActive = false;
                await sub.save();

                // Supprimer QR Code si plus d'abonnement actif
                const activeSubs = await Subscription.findOne({ clientId: sub.clientId, isActive: true }).sort({ endDate: -1 });
                if(activeSubs) {
                    logger.info(`Abonnement ${sub._id} annulé automatiquement. Un autre abonnement actif existe jusqu'au ${activeSubs.endDate}.`);
                    continue; // Ne pas supprimer le QR Code si un autre abonnement actif existe
                } else {
                    const passages = await Passage.find({ clientId: sub.clientId});
                    for (const passage of passages) {
                        passage.status = false; // Marquer les passages comme invalides
                        await passage.save();
                    }
                    const user = await User.findById(sub.clientId);
                    if (user) {
                        user.agencyId = null;
                        user.subscriptionId = null;
                        await Notification.create({ userId: sub.clientId, type: 'Subscribed', message: 'Votre abonnement a expiré' });
                        await user.save();
                    }
                }

                logger.info(`Abonnement ${sub._id} annulé automatiquement.`);
            }

            logger.info(`Vérification des abonnements terminée. ${expiredSubscriptions.length} abonnement(s) annulé(s).`);
        } catch (error) {
            logger.error('Erreur dans le scheduler des abonnements:', error);
        }
    });
};

module.exports = scheduleSubscriptionCancellation;
