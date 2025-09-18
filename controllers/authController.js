import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto, { randomUUID } from 'crypto';
import Wallet from '../models/Wallet.js';

import User from '../models/User.js';
import Client from '../models/clients/Client.js';
import employees from '../models/Agency/Employee.js';
import Agency from '../models/Agency/Agency.js';
import MunicipalManager from '../models/Mairies/MunicipalManager.js';
import Admin from '../models/admin/admin.js';
import QRCode from 'qrcode';
import { sendQRCodeEmail } from '../utils/qrcodemail.js';

import { sendResetCodeEmail } from '../utils/resetcodemail.js';
import { isBlacklisted, addToBlacklist } from '../middlewares/tokenBlacklist.js';

// const DEFAULT_LIMIT = 10;
// const DEFAULT_PAGE = 1;

// Cache temporaire pour les codes de vérification
const verificationCodes = new Map();

/* --------------------------- ENREGISTREMENT --------------------------- */

export const register = async (req, res) => {
  let createdUser = null;
  let createdProfile = null;
  let normalizedRole = null;

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
      receiveOffers = false
    } = req.body;

    // ✅ Vérification du rôle
    if (!role || typeof role !== 'string') {
      return res.status(400).json({
        message: 'Le rôle est requis et doit être une chaîne de caractères.',
        error: 'ROLE_REQUIRED'
      });
    }

    normalizedRole = role.trim().toLowerCase();
    const allowedRoles = ['client', 'agency'];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(403).json({
        message: 'Rôle non autorisé pour cette route.',
        error: 'INVALID_ROLE_FOR_ROUTE'
      });
    }

    // ✅ Champs obligatoires
    if (!email || !password || !firstName || !lastName || !phone || acceptTerms !== true) {
      return res.status(400).json({
        message: 'Champs obligatoires manquants ou conditions non acceptées.',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
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

    // 🔍 Vérifie si email déjà utilisé
    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.status(400).json({
        message: 'Email déjà utilisé.',
        error: 'EMAIL_ALREADY_EXISTS'
      });
    }

    if (normalizedRole === 'agency' && (!agencyName || agencyName.trim() === '')) {
      return res.status(400).json({
        message: "Nom de l'agence requis pour le rôle agency.",
        error: 'AGENCY_NAME_REQUIRED'
      });
    }

    if (normalizedRole === 'client') {
      const requiredFields = ['street', 'doorNumber', 'neighborhood', 'city', 'arrondissement'];
      for (const field of requiredFields) {
        if (!address[field] || typeof address[field] !== 'string' || address[field].trim() === '') {
          return res.status(400).json({
            message: `Champ d'adresse manquant ou invalide : ${field}`,
            error: 'CLIENT_ADDRESS_INCOMPLETE'
          });
        }
      }
    }

    // 🔐 Hash mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // 👤 Création utilisateur
    createdUser = await User.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: normalizedRole,
      isActive: true
    });

     const newWallet = new Wallet({
      userId: createdUser._id,
      balance: 0,
      kind: 'standard'
    });
    await newWallet.save();

    let profileData = {};

    if (normalizedRole === 'client') {
      // ⬇️ Création profil sans QR au départ
      createdProfile = await Client.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        address: {
          street: address.street.trim(),
          doorNumber: address.doorNumber.trim(),
          doorColor: address.doorColor ? address.doorColor.trim() : '',
          sector: address.sector ? address.sector.trim() : '',
          neighborhood: address.neighborhood.trim(),
          city: address.city.trim(),
          postalCode: address.postalCode ? address.postalCode.trim() : '',
          arrondissement: address.arrondissement.trim()
        },
        acceptTerms,
        receiveOffers,
        userId: createdUser._id
      });

      // 🔗 Génération de l’URL et image QR
      // const qrToken = `http://localhost:3000/api/collecte/scan?id=${createdProfile._id}`;
      const qrToken = `https://projectwise.onrender.com/api/collecte/scan?id=${createdProfile._id}`;
      const qrCodeImage = await QRCode.toDataURL(qrToken);

      createdProfile.qrToken = qrToken;
      createdProfile.qrCodeImage = qrCodeImage;
      await createdProfile.save();

      // 📧 Envoi de l’e-mail avec le QR code
      await sendQRCodeEmail(email, firstName.trim(), qrCodeImage);

    } else if (normalizedRole === 'agency') {
      const licenseNumber = `AGCY-${randomUUID()}`;

      profileData = {
        agencyName: agencyName.trim(),
        agencyDescription: agencyDescription ? agencyDescription.trim() : '',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        licenseNumber,
        address: {
          street: address.street.trim(),
          sector: address.sector ? address.sector.trim() : '',
          neighborhood: address.neighborhood ? address.neighborhood.trim() : '',
          city: address.city.trim(),
          postalCode: address.postalCode ? address.postalCode.trim() : '',
          latitude: address.latitude || null,
          longitude: address.longitude || null,
          arrondissement: address.arrondissement ? address.arrondissement.trim() : ''
        },
        acceptTerms,
        receiveOffers,
        clients: [],
        collectors: [],
        members: [{
          user: createdUser._id,
          role: 'owner'
        }],
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

    if (createdUser) await User.findByIdAndDelete(createdUser._id);
    if (createdProfile) {
      const ProfileModel = normalizedRole === 'client' ? Client : Agency;
      await ProfileModel.findByIdAndDelete(createdProfile._id);
    }

    return res.status(500).json({
      message: "Erreur serveur lors de l'inscription",
      error: 'SERVER_ERROR',
      details: error.message
    });
  }
};

// export const regenerateQRCode = async (req, res) => {
//   try {
//     const { clientId } = req.params; // ou req.user._id si authentifié

//     // Vérifie si le client existe
//     const client = await Client.findById(clientId);
//     if (!client) {
//       return res.status(404).json({
//         message: "Client introuvable",
//         error: "CLIENT_NOT_FOUND"
//       });
//     }

//     // Génère un nouveau token unique (option : ajoute timestamp pour invalider l’ancien)
//     const qrToken = `https://projectwise.onrender.com/api/collecte/scan?id=${client._id}&ts=${Date.now()}`;
//     const qrCodeImage = await QRCode.toDataURL(qrToken);

//     // Mets à jour dans la base
//     client.qrToken = qrToken;
//     client.qrCodeImage = qrCodeImage;
//     await client.save();

//     // (Optionnel) renvoyer par email
//     if (client.email) {
//       await sendQRCodeEmail(client.email, client.firstName, qrCodeImage);
//     }

//     return res.status(200).json({
//       message: "QR code régénéré avec succès",
//       qrToken,
//       qrCodeImage
//     });
//   } catch (error) {
//     console.error("Erreur lors de la régénération du QR code:", error);
//     return res.status(500).json({
//       message: "Erreur serveur lors de la régénération du QR code",
//       error: error.message
//     });
//   }
// };


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

    // Vérifie si le compte de l'agence est activé
    if (user.role === 'agency') {
      if (!user.isActive) {
        return res.status(403).json({
          message: 'Votre compte agence est en cours de validation par l’administrateur.'
        });
      }

      // Optionnel : tu peux aussi vérifier que l’agence elle-même est active
      const agency = await Agency.findOne({ userId: user._id });
      if (!agency) {
        return res.status(404).json({ message: 'Profil agence introuvable' });
      }

      if (!agency.isActive) {
        return res.status(403).json({
          message: 'Votre agence n’est pas encore activée. Veuillez patienter pendant la validation.'
        });
      }
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1440m' }
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

    // Blacklist le token pour qu’il ne soit plus utilisable
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

/* ------------------------------- CHANGEPASSWORD ------------------------------- */
export const changePassword = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    // const userId = req.user.id;
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    } 
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.status(200).json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};




export const getAllAgencies = async (req, res) => {
  try {
    const { query } = req.query;

    const filter = query ? { name: new RegExp(query, 'i') } : {};

    const agencies = await Agency.find(filter)
      .populate({
        path: 'clients',
        model: 'Client',
        populate: {
          path: 'userId',
          model: 'User',
          select: '-password -__v -updatedAt' // on masque le mot de passe
        },
        select: '-__v -updatedAt'
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: agencies.length,
      data: agencies,
      query: query || ''
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
