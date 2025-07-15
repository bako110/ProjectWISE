import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/user.js';
import Client from '../models/Client.js';
import Agency from '../models/Agency.js';
import MunicipalManager from '../models/MunicipalManager.js';

import { sendResetCodeEmail } from '../utils/resetcodemail.js';
import { isBlacklisted, addToBlacklist } from '../middlewares/tokenBlacklist.js';

// Cache in-memory pour stocker temporairement les codes de vérification (email → { code, expiresAt })
const verificationCodes = new Map();

/* --------------------------- ENREGISTREMENT --------------------------- */
export const register = async (req, res) => {
  try {
    // Extraction des champs possibles
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      name     // pour l’agence
    } = req.body;

    /*─────────── VALIDATIONS GÉNÉRALES ───────────*/

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs requis' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const allowedRoles = ['client', 'agence', 'mairie'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Inscription interdite pour ce rôle' });
    }

    /*─────────── VALIDATIONS SPÉCIFIQUES AU RÔLE ───────────*/

    if (role === 'client') {
      if (!firstName || !lastName || !phone) {
        return res.status(400).json({ message: 'Prénom, nom et téléphone sont obligatoires pour un client.' });
      }
    }

    if (role === 'agence') {
      if (!name) {
        return res.status(400).json({ message: 'Le nom de l’agence est obligatoire.' });
      }
    }

    if (role === 'mairie') {
      if (!firstName || !lastName) {
        return res.status(400).json({ message: 'Prénom et nom sont obligatoires pour une mairie.' });
      }
    }

    /*─────────── CRÉATION DE L'UTILISATEUR ───────────*/

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      isActive: true
    });

    /*─────────── PROFIL SPÉCIFIQUE ───────────*/

    switch (role) {
      case 'client':
        await Client.create({
          userId: user._id,
          firstName,
          lastName,
          phone,
          subscribedAgencyId: null,   // à lier plus tard
        });
        break;

      case 'agence':
        await Agency.create({
          userId: user._id,
          name,
          collectors: [],
          clients: []
        });
        break;

      case 'mairie':
        await MunicipalManager.create({
          userId: user._id,
          firstName,
          lastName,
          phone: phone || '',
          agencyId: []    // agences rattachées ajoutées plus tard
        });
        break;
    }

    /*─────────── RÉPONSE ───────────*/
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      userId: user._id,
      role: user.role
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
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