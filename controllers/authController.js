import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto, { randomUUID } from 'crypto';

import User from '../models/User.js';
import Client from '../models/clients/Client.js';
import Agency from '../models/Agency/Agency.js';
import MunicipalManager from '../models/Mairies/MunicipalManager.js';

import { sendResetCodeEmail } from '../utils/resetcodemail.js';
import { isBlacklisted, addToBlacklist } from '../middlewares/tokenBlacklist.js';

// Cache in-memory pour stocker temporairement les codes de vérification (email → { code, expiresAt })
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
      name,
      description,
      termsAccepted,
      receiveOffers = false,
      arrondissement,
      rue,
      quartier,
      numero,
      couleurPorte,
      ville,
      licenceNumber,
      codePostal
    } = req.body;

    if (!email || !password || !role || !firstName || !lastName || !phone || termsAccepted !== true) {
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
        message: 'Format d\'email invalide.',
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

    const allowedRoles = ['client', 'agence', 'mairie'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: 'Rôle non autorisé.',
        error: 'INVALID_ROLE'
      });
    }

    if (role === 'agence' && !name) {
      return res.status(400).json({
        message: 'Nom de l\'agence requis pour le rôle agence.',
        error: 'AGENCY_NAME_REQUIRED'
      });
    }

    if (role === 'client') {
      if (!arrondissement || !rue || !quartier || !ville) {
        return res.status(400).json({
          message: 'Adresse complète requise pour le client (arrondissement, rue, quartier, ville).',
          error: 'CLIENT_ADDRESS_INCOMPLETE'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let profileData = {};

    try {
      switch (role) {
        case 'client':
          profileData = {
            firstName,
            lastName,
            phone,
            subscribedAgencyId: null,
            termsAccepted,
            receiveOffers,
            serviceAddress: {
              arrondissement,
              rue,
              quartier,
              numero: numero || '',
              couleurPorte: couleurPorte || '',
              ville,
              codePostal: codePostal || ''
            }
          };
          break;

        case 'agence':
          profileData = {
            name,
            phone,
            description: description || '',
            termsAccepted,
            licenseNumber: licenceNumber || randomUUID(),
            receiveOffers,
            collectors: [],
            clients: []
          };
          break;

        case 'mairie':
          profileData = {
            firstName,
            lastName,
            phone,
            agencyId: []
          };
          break;

        default:
          throw new Error(`Rôle non supporté: ${role}`);
      }
    } catch (profilePrepError) {
      console.error(`Erreur préparation profil ${role}:`, profilePrepError);
      return res.status(500).json({
        message: `Erreur lors de la préparation des données pour le rôle ${role}`,
        error: 'PROFILE_DATA_PREPARATION_FAILED',
        details: profilePrepError.message
      });
    }

    try {
      createdUser = await User.create({
        email,
        password: hashedPassword,
        role,
        isActive: true
      });

      console.log(`Utilisateur créé avec succès: ${createdUser._id}`);
    } catch (userError) {
      console.error('Erreur création utilisateur:', userError);
      return res.status(500).json({
        message: 'Erreur lors de la création de l\'utilisateur',
        error: 'USER_CREATION_FAILED',
        details: userError.message
      });
    }

    try {
      profileData.userId = createdUser._id;

      switch (role) {
        case 'client':
          createdProfile = await Client.create(profileData);
          break;

        case 'agence':
          createdProfile = await Agency.create(profileData);
          break;

        case 'mairie':
          createdProfile = await MunicipalManager.create(profileData);
          break;
      }

      if (!createdProfile) {
        throw new Error(`Échec de la création du profil ${role}`);
      }

      console.log(`Profil ${role} créé: ${createdProfile._id}`);

    } catch (profileError) {
      console.error(`Erreur création profil ${role}:`, profileError);

      if (createdUser) {
        try {
          await User.findByIdAndDelete(createdUser._id);
          console.log(`Utilisateur supprimé lors du cleanup: ${createdUser._id}`);
        } catch (cleanupError) {
          console.error('Erreur lors du cleanup utilisateur:', cleanupError);
        }
      }

      return res.status(500).json({
        message: `Erreur lors de la création du profil ${role}. Aucun compte n'a été créé.`,
        error: 'PROFILE_CREATION_FAILED',
        details: profileError.message
      });
    }

    if (!createdUser || !createdProfile) {
      console.error('Vérification finale échouée');

      if (createdUser) {
        try {
          await User.findByIdAndDelete(createdUser._id);
        } catch (cleanupError) {
          console.error('Erreur cleanup utilisateur:', cleanupError);
        }
      }

      if (createdProfile) {
        try {
          const ProfileModel = role === 'client' ? Client : role === 'agence' ? Agency : MunicipalManager;
          await ProfileModel.findByIdAndDelete(createdProfile._id);
        } catch (cleanupError) {
          console.error('Erreur cleanup profil:', cleanupError);
        }
      }

      return res.status(500).json({
        message: 'Erreur système lors de la création du compte',
        error: 'SYSTEM_ERROR'
      });
    }

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      userId: createdUser._id,
      profileId: createdProfile._id,
      role: createdUser.role,
      success: true
    });

  } catch (error) {
    console.error('Erreur globale inscription:', error);

    if (createdUser) {
      try {
        await User.findByIdAndDelete(createdUser._id);
        console.log(`Cleanup final utilisateur: ${createdUser._id}`);
      } catch (cleanupError) {
        console.error('Erreur cleanup final utilisateur:', cleanupError);
      }
    }

    if (createdProfile) {
      try {
        const ProfileModel = req.body.role === 'client' ? Client : req.body.role === 'agence' ? Agency : MunicipalManager;
        await ProfileModel.findByIdAndDelete(createdProfile._id);
        console.log(`Cleanup final profil: ${createdProfile._id}`);
      } catch (cleanupError) {
        console.error('Erreur cleanup final profil:', cleanupError);
      }
    }

    res.status(500).json({
      message: 'Erreur serveur lors de l\'inscription',
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

    if (!user.isActive) {
      return res.status(403).json({ message: 'Votre compte est désactivé' });
    }

    const token = jwt.sign(
      { 
        _id: user._id, 
        role: user.role, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    if (isBlacklisted(token)) {
      return res.status(403).json({ message: 'Session invalide, veuillez vous reconnecter.' });
    }

    res.json({ 
      token, 
      role: user.role, 
      userId: user._id, 
      expiresIn: 86400,
      email: user.email
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