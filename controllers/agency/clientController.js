// controllers/agency/clientController.js
import mongoose from 'mongoose';
import Client from '../../models/clients/Client.js';
import Agency from '../../models/Agency/Agency.js';

/* ---------------------------------------------------------------------- */
/* 1. Liste des clients présents dans le tableau `clients` de l'agence    */
/* ---------------------------------------------------------------------- */
export const getClientsByAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;
    console.log('Recherche clients via agency.clients pour :', agencyId);

    // Vérifier que l'ID est bien un ObjectId
    const agId = new mongoose.Types.ObjectId(agencyId);

    // 1️⃣ Récupérer l'agence et son tableau "clients"
    const agency = await Agency.findById(agId).select('clients');
    if (!agency) {
      return res.status(404).json({ message: 'Agence non trouvée' });
    }

    // 2️⃣ Rechercher les clients dont _id figure dans ce tableau
    const clients = await Client.find({ _id: { $in: agency.clients } });
    console.log(`Nombre de clients trouvés : ${clients.length}`);

    res.status(200).json(clients);
  } catch (error) {
    console.error('Erreur getClientsByAgency :', error);
    res.status(500).json({ error: error.message });
  }
};

/* ---------------------------------------------------------------------- */
/* 2. Ajouter un signalement de non‑passage                               */
/* ---------------------------------------------------------------------- */
export const reportNoShow = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { type, comment, date } = req.body;   // comment correspond au champ description

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ error: 'Client non trouvé' });

    const newReport = {
      type,
      description: comment,                    // 🔑 utiliser comment → description
      date: date ? new Date(date) : new Date()
    };

    client.nonPassageReports.push(newReport);
    await client.save();

    res.json({ message: 'Report enregistré', nonPassageReports: client.nonPassageReports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ---------------------------------------------------------------------- */
/* 3. Valider la souscription d'un client                                 */
/* ---------------------------------------------------------------------- */
export const validateClientSubscription = async (req, res) => {
  console.log('✅ [validateClientSubscription] - Début');

  try {
    const { clientId } = req.params;
    const userId = req.user.id;

    /* Trouver l'agence liée à l'utilisateur connecté */
    const agency = await Agency.findOne({ userId });
    if (!agency) {
      return res.status(404).json({ message: 'Agence non trouvée pour cet utilisateur' });
    }

    const agencyId = agency._id.toString();

    /* Récupérer le client */
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    /* Vérifier l'appartenance à l'agence */
    if (client.subscribedAgencyId?.toString() !== agencyId) {
      return res.status(403).json({ message: 'Ce client n’est pas lié à votre agence' });
    }

    /* Mettre à jour la dernière entrée pending */
    await Client.updateOne(
      { _id: clientId },
      {
        $set: {
          subscriptionStatus: 'active',
          'subscriptionHistory.$[elem].status': 'active',
          'subscriptionHistory.$[elem].date': new Date()
        }
      },
      { arrayFilters: [{ 'elem.status': 'pending' }] }
    );

    /* Recharger le client mis à jour */
    const updatedClient = await Client.findById(clientId);

    console.log('✅ Abonnement validé pour le client:', updatedClient._id);
    return res.status(200).json({
      message: 'Abonnement validé avec succès',
      client: {
        id: updatedClient._id,
        firstName: updatedClient.firstName,
        lastName: updatedClient.lastName,
        phone: updatedClient.phone,
        subscriptionStatus: updatedClient.subscriptionStatus,
        subscriptionHistory: updatedClient.subscriptionHistory
      }
    });
  } catch (error) {
    console.error('💥 Erreur serveur:', error.message);
    return res.status(500).json({
      message: 'Erreur lors de la validation',
      error: error.message
    });
  }
};



// Récupérer tous les signalements des clients d’une agence
export const getReportsByAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    // Récupérer clients abonnés à cette agence
    const clients = await Client.find({ subscribedAgencyId: agencyId }, 'firstName lastName nonPassageReports');

    if (!clients.length) {
      return res.status(404).json({ message: "Aucun client trouvé pour cette agence" });
    }

    // Optionnel : filtrer ou organiser les rapports selon besoin

    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
