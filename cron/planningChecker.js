// cron/planningsCron.js
import cron from 'node-cron';
import CollectionSchedule from '../models/Agency/CollectionSchedule.js';
import Client from '../models/clients/Client.js';
import ScanReport from '../models/Agency/ScanReport.js';
import Notification from '../models/Notification.js';
import Agency from '../models/Agency/Agency.js';

cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Vérification des plannings à désactiver...');
    const startDate = new Date(new Date().setHours(0, 0, 0, 0));
    const endDate = new Date(new Date().setHours(23, 59, 59, 999));
    try {
      const plannings = await CollectionSchedule.find({ isActive: true, createdAt: { $gte: startDate, $lt: endDate } });

      for (const planning of plannings) {
        const agencyId = planning.agencyId;
        const planningZones = planning.zone || [];

        // Clients associés au planning
        const clients = await Client.find({
          subscribedAgencyId: agencyId,
          "address.neighborhood": { $in: planningZones }
        });

        if (clients.length === 0) continue;

        const clientIds = clients.map(c => c._id);

        // Vérifie la présence de scanReports pour les clients
        const reports = await ScanReport.find({ clientId: { $in: clientIds } });

        const clientsWithReports = new Set(reports.map(r => r.clientId.toString()));

        const allScanned = clients.every(client =>
          clientsWithReports.has(client._id.toString())
        );

        // Désactivation si tous scannés
        if (allScanned) {
          planning.isActive = false;
          await planning.save();
          const agency = await Agency.findById(agencyId);
          if (agency) {
            const notification = new Notification({
              userId: agency.userId,
              message: 'La collecte de la zone ' + planning.zone + ' est terminée.',
              type: 'Planning',
            });
            await notification.save();
          }
          console.log(`✅ Planning désactivé automatiquement : ${planning._id}`);
        } else {
          console.log(`⏳ Planning encore actif : ${planning._id}`);
        }
      }

      console.log('[CRON] Vérification terminée.');

    } catch (error) {
      console.error('[CRON] Erreur lors de la désactivation des plannings :', error);
    }
  });
console.log('Planning cron task started.');