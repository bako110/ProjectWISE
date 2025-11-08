const User = require('../models/User.js');
const Agency = require('../models/agency.js');
const jwt = require('jsonwebtoken');
const { sendResetPasswordEmail } = require('../utils/sendResetCodeMail.js');

const registerUser = async (userData) => {
  const existingUser = await User.findOne({ $or: [ { email: userData.email }, { phone: userData.phone } ] });
  if (existingUser) {
    throw new Error('Un utilisateur avec cet email ou téléphone existe déjà');
  }
  const user = new User(userData);
  await user.save();
  const newUser = user.toObject();
  delete newUser.password;
  return newUser;
}

const createAgency = async (agencyData) => {

  const existingAgency = await Agency.findOne({ name: agencyData.name });
  if (existingAgency) {
    throw new Error('Une agence avec ce nom existe déjà');
  }
  const agency = new Agency(agencyData);
  // await agency.save();
  return agency;
}

const loginUser = async (login, password) => {
    const user = await User.findOne({ $or: [ { email: login }, { phone: login } ] });
    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Mot de passe incorrect');
    }
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

const genererateToken = async (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        email: user.email,
        agencyId: user.agencyId || null, // <- ajouter ici
        isOwnerAgency: user.isOwnerAgency || false
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
}



// SYSTÈME DE MOT DE PASSE PERDU AVEC CODE À 6 CHIFFRES

// Générer un code de réinitialisation à 6 chiffres
const generateResetCode = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Aucun utilisateur trouvé avec cet email');
  }

  // Générer un code à 6 chiffres
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Sauvegarder le code en clair
  user.resetPasswordCode = resetCode;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
  await user.save();

  return resetCode;
}

// Vérifier la validité du code (sans email)
const verifyResetCode = async (code) => {
  const user = await User.findOne({
    resetPasswordCode: code,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Code invalide ou expiré');
  }

  return { valid: true, email: user.email };
}

// Réinitialiser le mot de passe avec le code uniquement
const resetPasswordWithCode = async (code, newPassword) => {
  const user = await User.findOne({
    resetPasswordCode: code,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Code invalide ou expiré');
  }

  // Mettre à jour le mot de passe
  user.password = newPassword;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpires = undefined;
  
  await user.save();

  return user;
}

// NOUVELLE FONCTION : Réinitialiser le mot de passe avec seulement le nouveau mot de passe
const resetPassword = async (newPassword) => {
  // Cette fonction nécessite que l'utilisateur soit authentifié ou ait un token valide
  // Pour l'instant, on va créer une fonction simple qui nécessite un contexte d'utilisateur
  throw new Error('Cette fonction nécessite une implémentation spécifique avec authentification');
}

// Demande de réinitialisation (étape 1)
const requestPasswordReset = async (email) => {
  try {
    const resetCode = await generateResetCode(email);
    await sendResetPasswordEmail(email, resetCode);
    return { message: 'Email de réinitialisation envoyé' };
  } catch (error) {
    throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
  }
}

module.exports = { 
  genererateToken, 
  registerUser, 
  createAgency, 
  loginUser, 
  requestPasswordReset,
  resetPasswordWithCode,
  verifyResetCode,
  resetPassword
};