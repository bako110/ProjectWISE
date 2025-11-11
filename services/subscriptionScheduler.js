const cron = require('node-cron');
const Subscription = require('../models/subscription.js');
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
                const user = await User.findById(sub.clientId);
                if (user) {
                    const activeSub = await Subscription.findOne({ clientId: user._id, isActive: true });
                    if (!activeSub) {
                        user.qrCode = null;
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
