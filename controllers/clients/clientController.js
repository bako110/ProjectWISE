// 📁 controllers/clientController.js

import mongoose from 'mongoose';
import Client from '../../models/clients/Client.js';
import Agency from '../../models/Agency/Agency.js';
import User from '../../models/User.js';

// 🔹 Client s’abonne à une agence
export const subscribeToAgency = async (req, res) => {
  try {
    const userId = req.user?.id; // ID du user connecté (depuis token)

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const { agencyId } = req.body;
    if (!agencyId) {
      return res.status(400).json({ message: 'ID de l’agence requis' });
    }

    // 🧠 Conversion explicite en ObjectId
    const client = await Client.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ message: 'Agence non trouvée' });
    }

    // Vérifie s’il est déjà abonné
    if (client.subscribedAgencyId?.toString() === agencyId) {
      return res.status(400).json({ message: 'Déjà abonné à cette agence' });
    }

    // Mise à jour des infos d’abonnement
    client.subscribedAgencyId = agencyId;
    client.subscriptionStatus = 'pending'; // en attente de validation
    client.subscriptionHistory.push({
      date: new Date(),
      status: 'pending',
      offer: '' // optionnel : tu peux ajouter une offre spécifique
    });

    await client.save();

    // Ajouter le client à la liste de l'agence
    if (!agency.clients.includes(client._id)) {
      agency.clients.push(client._id);
      await agency.save();
    }

    res.status(200).json({ message: 'Demande d’abonnement envoyée avec succès' });

  } catch (error) {
    console.error('Erreur subscribeToAgency:', error);
    res.status(500).json({ message: 'Erreur lors de l’abonnement', error: error.message });
  }
};

// 🔹 Récupération du profil client
export const getClientProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    // 🔁 Conversion ObjectId
    const clientProfile = await Client.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('subscribedAgencyId', 'agencyName phone agencyDescription isVerified')
      .lean();

    if (!clientProfile) {
      return res.status(404).json({ success: false, message: 'Profil client introuvable' });
    }

    res.status(200).json({ success: true, client: clientProfile });

  } catch (error) {
    console.error('Erreur getClientProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil client',
      error: error.message
    });
  }
};

// 🔹 Récupération d’un client par son ID (admin / agence)
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifie la validité de l’ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID client invalide.' });
    }

    // Recherche du client + population éventuelle
    const client = await Client.findById(id)
      .populate('userId', '-password -__v -updatedAt')   // masque mot de passe
      .lean();

    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }

    return res.status(200).json({ success: true, data: client });

  } catch (error) {
    console.error('Erreur récupération client :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du client.',
      details: error.message
    });
  }
};
