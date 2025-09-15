import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Agency from '../models/Agency/Agency.js';
import Client from '../models/clients/Client.js';

// Tâche cron pour vérifier les abonnements expirés tous les jours à minuit
cron.schedule('0 * * * *', async () => {
    const now = new Date();
    try {
        const expiredSubscriptions = await Subscription.find({ endDate: { $lt: now }, status: 'active' });
        console.log(`Vérification des abonnements expirés à ${now.toISOString()}. Abonnements trouvés: ${expiredSubscriptions.length}`);
        for (const subscription of expiredSubscriptions) {
            subscription.status = 'canceled';
            await subscription.save();
            const user = await User.findById(subscription.userId);
            // console.log(`Abonnement expiré pour l'utilisateur: ${user ? user.email : 'Utilisateur non trouvé'}`);
            const client = await Client.findOne({ userId: subscription.userId });

            const agency = await Agency.findById(subscription.agencyId);
            // console.log(agency);
            if (agency) {
                agency.clients = agency.clients.filter(clientId => clientId.toString() !== client._id.toString());
                await agency.save();
                // console.log(agency);
            }

            // console.log(client);
            if (client) {
                client.subscribedAgencyId = null;
                // client.subscriptionStatus = 'canceled';
                await client.save();
                // console.log(client);
            }
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