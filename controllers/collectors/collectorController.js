import mongoose from 'mongoose';
import Agency from '../../models/Agency/Agency.js';
import Collector from '../../models/Collectors/Collector.js';

export const createCollector = async (req, res) => {
  try {
    // ✅ 1) Vérifier que le demandeur est bien une agence
    if (req.user.role !== 'agence') {
      return res.status(403).json({ message: 'Accès réservé aux agences uniquement' });
    }

    // ✅ 2) Vérifier que l'ID utilisateur est présent
    if (!req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié correctement' });
    }

    console.log("🔍 ID utilisateur (req.user.id) :", req.user.id);

    // ✅ 3) Récupérer l’agence du demandeur
    const agency = await Agency.findOne({ userId: req.user.id });

    if (!agency) {
      return res.status(404).json({ message: 'Agence introuvable pour cet utilisateur' });
    }

    // ✅ 4) Extraire & valider les champs du collecteur
    const {
      firstName,
      lastName,
      phone,
      assignedSectors = [],
      vehicleInfo = {}
    } = req.body;

    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ message: 'Prénom, nom et téléphone sont requis' });
    }

    // ✅ 5) Créer le collecteur lié à l’agence
    const collector = await Collector.create({
      userId: null, // À lier plus tard si besoin
      agencyId: agency._id,
      firstName,
      lastName,
      phone,
      assignedSectors,
      vehicleInfo
    });

    // ✅ 6) Ajouter son ID dans la liste des collecteurs de l’agence
    agency.collectors.push(collector._id);
    await agency.save();

    // ✅ 7) Réponse
    res.status(201).json({
      message: 'Collecteur créé avec succès',
      collectorId: collector._id,
      agencyId: agency._id
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du collecteur :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
