// controllers/agency/clientController.js
import Client from '../../models/clients/Client.js';
import Agency from '../../models/Agency/Agency.js';

// Liste des clients abonnés à une agence
export const getClientsByAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;
    console.log("Recherche clients pour l'agence :", agencyId);

    const clients = await Client.find({ subscribedAgencyId: agencyId });
    console.log(`Nombre de clients trouvés : ${clients.length}`);

    res.json(clients);
  } catch (error) {
    console.error("Erreur getClientsByAgency :", error);
    res.status(500).json({ error: error.message });
  }
};

// Ajouter un signalement de non-passage par un client
export const reportNoShow = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { type, comment, date } = req.body;

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const newReport = {
      type,
      description,
      date: date ? new Date(date) : new Date()  // convertit la date envoyée, ou date actuelle si absente
    };

    client.nonPassageReports.push(newReport);  // corrigé : nonPassageReports (comme dans le modèle)
    await client.save();

    res.json({ message: 'Report saved', nonPassageReports: client.nonPassageReports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validateClientSubscription = async (req, res) => {
  console.log("✅ [validateClientSubscription] - Début");

  try {
    const { clientId } = req.params;
    const userId = req.user.id;

    // 🔍 Trouver l'agence liée à l'utilisateur connecté
    const agency = await Agency.findOne({ userId });
    if (!agency) {
      console.log("❌ Agence non trouvée");
      return res.status(404).json({ message: 'Agence non trouvée pour cet utilisateur' });
    }

    const agencyId = agency._id.toString();

    // 🔍 Récupérer le client
    const client = await Client.findById(clientId);
    if (!client) {
      console.log("❌ Client non trouvé");
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    if (client.subscribedAgencyId?.toString() !== agencyId) {
      console.log("⛔ Ce client n’est pas lié à votre agence");
      return res.status(403).json({ message: 'Ce client n’est pas lié à votre agence' });
    }

    // ✅ Mise à jour ciblée du statut de la dernière demande avec updateOne (évite validation complète)
    await Client.updateOne(
      { _id: clientId },
      {
        $set: {
          subscriptionStatus: 'active',
          'subscriptionHistory.$[elem].status': 'active',
          'subscriptionHistory.$[elem].date': new Date(),
        }
      },
      {
        arrayFilters: [{ 'elem.status': 'pending' }]
      }
    );

    console.log("✅ Abonnement validé pour le client:", client._id);
    return res.status(200).json({
      message: 'Abonnement validé avec succès',
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        subscriptionStatus: 'active',
        subscriptionHistory: client.subscriptionHistory
      }
    });

  } catch (error) {
    console.error("💥 Erreur serveur:", error.message);
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
