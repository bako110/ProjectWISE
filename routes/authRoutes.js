import express from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  verifyCode,
  resetPassword
} from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Inscription
router.post('/register', register);

// Connexion
router.post('/login', login);

// Déconnexion sécurisée avec middleware
router.post('/logout', authMiddleware, logout);

// Demande de mot de passe oublié (envoie de code par email)
router.post('/forgotPassword', forgotPassword);

// Vérification du code (sans email dans le corps, basé sur code uniquement)
router.post('/verifyCode', verifyCode);

// Réinitialisation avec token passé dans l’URL
router.post('/resetPassword/:token', resetPassword);

export default router;
