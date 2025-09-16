import bcrypt from 'bcryptjs';
import User from "../../models/User.js";
import MunicipalManager from "../../models/Mairies/MunicipalManager.js";
import Agency from '../../models/Agency/Agency.js';
import Client from '../../models/clients/Client.js';

/* --------------------------- CRÉATION MUNICIPALITÉ PAR ADMIN --------------------------- */
export const registerMunicipality = async (req, res) => {
  let createdUser = null;
  let createdProfile = null;

  try {
    const {
      email,
      password,
      role,
      firstName,    // prénom du contact mairie
      lastName,     // nom du contact mairie
      name,         // nom de la mairie (ex: Mairie de Ouagadougou)
      phone,
      // autres champs spécifiques mairie si besoin
    } = req.body;

    // Vérification du rôle strict
    if (role !== 'municipality') {
      return res.status(403).json({
        message: 'Rôle non autorisé pour cette route.',
        error: 'INVALID_ROLE_FOR_ROUTE'
      });
    }

    // Validation précise des champs obligatoires
    const requiredFields = { email, password, role, firstName, lastName, name, phone };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value.toString().trim() === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Champs obligatoires manquants: ' + missingFields.join(', '),
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Mot de passe trop court (min 8 caractères).',
        error: 'PASSWORD_TOO_SHORT'
      });
    }

    // Vérification email avec regex simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format d'email invalide.",
        error: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Vérifie si email déjà existant
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: 'Email déjà utilisé.',
        error: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Création de l'utilisateur
    createdUser = await User.create({
      email,
      password: hashedPassword,
      role,
      isActive: true
    });

    // Préparation des données de profil mairie
    const profileData = {
      userId: createdUser._id,
      firstName,
      lastName,
      name,
      phone,
      isActive: true
      // ajoute d’autres champs spécifiques ici si besoin
    };

    // Création du profil municipal manager
    createdProfile = await MunicipalManager.create(profileData);

    // Réponse succès
    return res.status(201).json({
      message: 'Municipalité créée avec succès',
      userId: createdUser._id,
      profileId: createdProfile._id,
      role: createdUser.role,
      success: true
    });

  } catch (error) {
    console.error('Erreur création municipalité:', error);

    if (createdUser) await User.findByIdAndDelete(createdUser._id);
    if (createdProfile) await MunicipalManager.findByIdAndDelete(createdProfile._id);

    return res.status(500).json({
      message: "Erreur serveur lors de la création municipalité",
      error: 'SERVER_ERROR',
      details: error.message
    });
  }
};

export const getMunicipality = async (req, res) => {
  const { municipalityId } = req.params;

  if (!municipalityId) {
    return res.status(400).json({ message: 'Municipality ID is required' });
  }

  try {
    const profile = await MunicipalManager.findById(municipalityId);

    if (!profile) {
      return res.status(404).json({ message: 'Municipality profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching municipality profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const getAllMunicipalities = async (req, res) => {
  try {
    const municipalities = await MunicipalManager.find();

    if (municipalities.length === 0) {
      return res.status(404).json({ message: 'No municipalities found' });
    }

    res.status(200).json(municipalities);
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const statisticsByCity = async (req, res) => {
  try {
    const totalAgency = await Agency.countDocuments();
    const totalClients = await Client.countDocuments();

    const agenciesByCity = await Agency.aggregate([
      { $group: { city: "$address.city" } },
      { $sum: { count: 1 } }
    ]);

    const clientsByCity = await Client.aggregate([
      { $group: { city: "$address.city" } },
      { $sum: { count: 1 } }
    ]);

    const statistics = agenciesByCity.reduce((acc, curr) => {
      acc[curr.city] = {
        city: curr.city,
        agencies: curr.count,
        clients: clientsByCity.find(c => c.city === curr.city)?.count || 0
      };
      return acc;
    }, {});

    res.status(200).json(statistics);
  } catch (error) {
    console.error('Error fetching statistics by city:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
