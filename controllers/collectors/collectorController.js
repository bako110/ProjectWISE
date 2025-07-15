// controllers/collectorController.js
import mongoose from 'mongoose';
import Agency from '../../models/Agency/Agency.js';
import Collector from '../../models/Collectors/Collector.js';

export const createCollector = async (req, res) => {
  try {
    // 1) Vérifier que le demandeur est bien une agence
    if (req.user.role !== 'agence') {
      return res.status(403).json({ message: 'Accès réservé aux agences' });
    }

    // 2) Récupérer l’agence du demandeur
    const agency = await Agency.findOne({ userId: req.user.id });
    if (!agency) {
      return res.status(404).json({ message: 'Agence introuvable' });
    }

    // 3) Extraire & valider les champs du collecteur
    const {
      firstName,
      lastName,
      phone,
      assignedSectors = [],  // corrigé : "assignedSectors" au lieu de "assignedAreas"
      vehicleInfo = {}
    } = req.body;

    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    // 4) Créer le collecteur lié à l’agence
    const collector = await Collector.create({
      // Si tu veux lier à un compte utilisateur, crée le User avant et mets son _id ici.
      // Ici on met null ou pas de userId pour l'instant.
      userId: null,
      agencyId: agency._id,
      firstName,
      lastName,
      phone,
      assignedSectors,
      vehicleInfo
    });

    // 5) Ajouter son ID dans la liste des collecteurs de l’agence
    agency.collectors.push(collector._id);
    await agency.save();

    // 6) Répondre
    res.status(201).json({
      message: 'Collecteur créé avec succès',
      collectorId: collector._id
    });

  } catch (error) {
    console.error('Création collecteur :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
