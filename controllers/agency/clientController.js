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


// Modifier profil client (adresse, abonnement)
// export const updateClientProfile = async (req, res) => {
//   try {
//     const clientId = req.params.id;
//     const updateData = req.body;

//     const client = await Client.findByIdAndUpdate(clientId, updateData, { new: true });
//     if (!client) return res.status(404).json({ error: 'Client non trouvé' });

//     res.json(client);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Ajouter un signalement de non-passage par un client
export const reportNonPassage = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { comment } = req.body;

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ error: 'Client non trouvé' });

    client.nonPassageReports.push({ comment });
    await client.save();

    res.json({ message: 'Signalement enregistré', nonPassageReports: client.nonPassageReports });
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

    // ✅ Mise à jour du statut de la dernière demande
    const lastEntry = [...client.subscriptionHistory].reverse().find(e => e.status === 'pending');
    if (lastEntry) {
      lastEntry.status = 'active';
      lastEntry.date = new Date(); // mettre à jour la date si souhaité
    }

    client.subscriptionStatus = 'active';
    await client.save();

    console.log("✅ Abonnement validé pour le client:", client._id);
    return res.status(200).json({
      message: 'Abonnement validé avec succès',
      client: {
        id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        subscriptionStatus: client.subscriptionStatus,
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
