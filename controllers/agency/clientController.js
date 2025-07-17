// controllers/agency/clientController.js
import Client from '../../models/clients/Client.js';

// Liste des clients abonnés à une agence
export const getClientsByAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const clients = await Client.find({ subscribedAgencyId: agencyId });
    res.json(clients);
  } catch (error) {
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
  try {
    const { clientId } = req.params;
    const agencyId = req.user.agencyId; // supposé que l’agence est connectée

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });

    if (client.subscribedAgencyId?.toString() !== agencyId) {
      return res.status(403).json({ message: 'Ce client n’est pas lié à votre agence' });
    }

    client.subscriptionStatus = 'validated';
    await client.save();

    res.status(200).json({ message: 'Abonnement validé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la validation', error });
  }
};