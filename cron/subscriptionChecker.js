import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

// Tâche cron pour vérifier les abonnements expirés tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    try {
        const expiredSubscriptions = await Subscription.find({ endDate: { $lt: now }, status: 'active' });
        for (const subscription of expiredSubscriptions) {
            subscription.status = 'expired';
            await subscription.save();
            const user = await User.findById(subscription.userId);
            if (user) {
                const wallet = await Wallet.findOne({ userId: user._id });
                if (wallet) {
                    // Logique de notification ou d'alerte
                    console.log(`L'abonnement de l'utilisateur ${user.email} est expiré. Solde du wallet: ${wallet.balance}`);
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des abonnements expirés :', error);
    }
}, {
    timezone: "Europe/Paris"
});
console.log('Tâche cron pour la vérification des abonnements expirés démarrée.');