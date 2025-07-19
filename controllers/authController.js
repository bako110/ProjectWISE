import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto, { randomUUID } from 'crypto';

import User from '../models/User.js';
import Client from '../models/clients/Client.js';
import employees from '../models/Agency/Employee.js';
import Agency from '../models/Agency/Agency.js';
import MunicipalManager from '../models/Mairies/MunicipalManager.js';
import Admin from '../models/admin/admin.js';

import { sendResetCodeEmail } from '../utils/resetcodemail.js';
import { isBlacklisted, addToBlacklist } from '../middlewares/tokenBlacklist.js';

// Cache temporaire pour les codes de vérification
const verificationCodes = new Map();

/* --------------------------- ENREGISTREMENT --------------------------- */

export const register = async (req, res) => {
  let createdUser = null;
  let createdProfile = null;

  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      agencyName,
      agencyDescription,
      address = {},
      acceptTerms,
      acceptNewsletter = false
    } = req.body;

    const allowedRoles = ['client', 'agency'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: 'Rôle non autorisé pour cette route.',
        error: 'INVALID_ROLE_FOR_ROUTE'
      });
    }

    // Vérification des champs requis
    if (!email || !password || !role || !firstName || !lastName || !phone || acceptTerms !== true) {
      return res.status(400).json({
        message: 'Champs obligatoires manquants ou conditions non acceptées.',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Mot de passe trop court (min 8 caractères).',
        error: 'PASSWORD_TOO_SHORT'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format d'email invalide.",
        error: 'INVALID_EMAIL_FORMAT'
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: 'Email déjà utilisé.',
        error: 'EMAIL_ALREADY_EXISTS'
      });
    }

    if (role === 'agency' && !agencyName) {
      return res.status(400).json({
        message: "Nom de l'agence requis pour le rôle agency.",
        error: 'AGENCY_NAME_REQUIRED'
      });
    }

    if (role === 'client') {
      if (!address.street || !address.doorNumber || !address.neighborhood || !address.city || !address.arrondissement) {
        return res.status(400).json({
          message: "Adresse complète requise pour le client (rue, numéro, quartier, ville).",
          error: 'CLIENT_ADDRESS_INCOMPLETE'
        });
      }
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Création de l'utilisateur principal
    createdUser = await User.create({
      email,
      password: hashedPassword,
      role,
      isActive: true
    });

    let profileData = {};

    // Création du profil client
    if (role === 'client') {
      profileData = {
        firstName,
        lastName,
        phone,
        termsAccepted: acceptTerms,
        receiveOffers: acceptNewsletter,
        serviceAddress: {
          rue: address.street,
          numero: address.doorNumber,
          arrondissement: address.district || '',
          couleurPorte: address.doorColor || '',
          quartier: address.neighborhood,
          ville: address.city,
          codePostal: address.postalCode || ''
        },
        userId: createdUser._id
      };

      createdProfile = await Client.create(profileData);

    } else if (role === 'agency') {
      // Générer un numéro de licence unique
      const licenseNumber = `AGCY-${randomUUID()}`;
      if (!licenseNumber) {
        throw new Error("La génération du numéro de licence a échoué.");
      }

      profileData = {
        name: agencyName,
        phone,
        description: agencyDescription || '',
        termsAccepted: acceptTerms,
        licenseNumber,
        receiveOffers: acceptNewsletter,
        collectors: [],
        clients: [],
        userId: createdUser._id
      };

      createdProfile = await Agency.create(profileData);
    }

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      userId: createdUser._id,
      profileId: createdProfile._id,
      role: createdUser.role,
      success: true
    });

  } catch (error) {
    console.error('Erreur globale inscription:', error);

    // Annuler la création si erreur
    if (createdUser) await User.findByIdAndDelete(createdUser._id);
    if (createdProfile) {
      const ProfileModel = role === 'client' ? Client : Agency;
      await ProfileModel.findByIdAndDelete(createdProfile._id);
    }

    return res.status(500).json({
      message: "Erreur serveur lors de l'inscription",
      error: 'SERVER_ERROR',
      details: error.message
    });
  }
};



/* ------------------------------- LOGIN -------------------------------- */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifie uniquement si l'agence est active
    if (user.role === 'agency' && !user.isActive) {
      return res.status(403).json({ message: 'Votre compte agence n’a pas encore été activé' });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    let profileData = {};

    switch (user.role) {
      case 'client':
        profileData = await Client.findOne({ userId: user._id }).lean();
        break;

      case 'manager':
      case 'collector':
        profileData = await employees.findOne({ userId: user._id }).lean();
        break;

      case 'agency':
        profileData = await Agency.findOne({ userId: user._id }).lean();
        break;

      case 'municipality':
        profileData = await MunicipalManager.findOne({ userId: user._id }).lean();
        break;

      case 'super_admin':
        profileData = await Admin.findOne({ userId: user._id }).lean();
        break;

      default:
        return res.status(400).json({ message: 'Rôle utilisateur non reconnu' });
    }

    if (!profileData) {
      return res.status(404).json({ message: `Profil ${user.role} introuvable.` });
    }

    res.json({
      token,
      expiresIn: 86400,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        ...profileData
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
/* ---------------------- MOT DE PASSE OUBLIÉ --------------------------- */

/* forgotPassword */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Aucun compte associé à cet email' });
    }

    // Générer code unique à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Stocker code → email avec expiration
    verificationCodes.set(verificationCode, {
      email,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    await sendResetCodeEmail(email, verificationCode);

    res.status(200).json({ message: 'Code de vérification envoyé' });
  } catch (error) {
    console.error('Erreur forgotPassword:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/* verifyCode */
export const verifyCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Code requis' });
    }

    const entry = verificationCodes.get(code);
    if (!entry) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    if (Date.now() > entry.expiresAt) {
      verificationCodes.delete(code);
      return res.status(400).json({ message: 'Code expiré' });
    }

    // Générer resetToken sécurisé pour la réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Mettre à jour l’utilisateur avec resetToken et expiration
    await User.findOneAndUpdate(
      { email: entry.email },
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: Date.now() + 60 * 60 * 1000, // 1 heure
      }
    );

    // Supprimer le code stocké pour éviter réutilisation
    verificationCodes.delete(code);

    res.status(200).json({
      message: 'Code vérifié avec succès',
      resetToken,  // à garder côté client pour resetPassword
    });
  } catch (error) {
    console.error('Erreur verifyCode:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/* resetPassword */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    if (!confirmNewPassword) {
      return res.status(400).json({ message: 'Veuillez confirmer le nouveau mot de passe' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Lien expiré ou invalide' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur resetPassword:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}; 


/* ------------------------------- LOGOUT ------------------------------- */
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({ message: 'Aucun token fourni' });
    }

    // Blacklist le token
    addToBlacklist(token);

    res.json({ 
      message: 'Déconnexion réussie', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};



export const getAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find().lean();

    return res.status(200).json({
      success: true,
      count: agencies.length,
      data: agencies
    });
  } catch (error) {
    console.error('Erreur récupération agences:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des agences',
      details: error.message
    });
  }
};


// Récupérer une agence par son ID
export const getAgencyById = async (req, res) => {
  try {
    const { id } = req.params;

    const agency = await Agency.findById(id).lean();

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    return res.status(200).json({
      success: true,
      data: agency
    });
  } catch (error) {
    console.error('Erreur récupération agence par ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l’agence',
      details: error.message
    });
  }
};

