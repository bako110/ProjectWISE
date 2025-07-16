import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import Agency from '../../models/Agency/Agency.js';
import Collector from '../../models/Collectors/Collector.js';
import User from '../../models/User.js';

export const createCollector = async (req, res) => {
  try {
    // ✅ 1. Vérifier que l'utilisateur connecté est une agence
    if (req.user.role !== 'agence') {
      return res.status(403).json({ message: 'Accès réservé aux agences uniquement' });
    }

    // ✅ 2. Vérifier que l'ID utilisateur est présent
    if (!req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié correctement' });
    }

    // ✅ 3. Récupérer l'agence correspondante
    const agency = await Agency.findOne({ userId: req.user.id });
    if (!agency) {
      return res.status(404).json({ message: 'Agence introuvable' });
    }

    // ✅ 4. Extraire et valider les données du body
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      assignedSectors = [],
      vehicleInfo = {}
    } = req.body;

    if (!email || !password || !confirmPassword || !firstName || !lastName || !phone) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Mot de passe trop court (min 8 caractères)' });
    }

    // ✅ 5. Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // ✅ 6. Créer un utilisateur collector
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: 'collecteur',
      isActive: true
    });

    // ✅ 7. Créer le profil collecteur
    const newCollector = await Collector.create({
      userId: newUser._id,
      agencyId: agency._id,
      firstName,
      lastName,
      phone,
      assignedSectors,
      vehicleInfo
    });

    // ✅ 8. Lier le collecteur à l’agence
    agency.collectors.push(newCollector._id);
    await agency.save();

    // ✅ 9. Retour au client
    res.status(201).json({
      message: 'Collecteur créé avec succès',
      collectorId: newCollector._id,
      userId: newUser._id,
      email: newUser.email
    });

  } catch (error) {
    console.error('❌ Erreur création collecteur :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
