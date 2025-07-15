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

/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Gestion des utilisateurs (inscription, connexion, réinitialisation)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       description: Données pour créer un utilisateur
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: strongPassword123
 *               role:
 *                 type: string
 *                 enum: [client, agence, mairie]
 *                 example: client
 *               firstName:
 *                 type: string
 *                 example: Jean
 *               lastName:
 *                 type: string
 *                 example: Dupont
 *               phone:
 *                 type: string
 *                 example: "+22670123456"
 *               name:
 *                 type: string
 *                 description: Nom de l'agence (si rôle agence)
 *                 example: Agence Propre
 *               licenseNumber:
 *                 type: string
 *                 example: AG-2024-001
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       description: Email et mot de passe
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: strongPassword123
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne un token JWT
 *       401:
 *         description: Email ou mot de passe incorrect
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion sécurisée
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/auth/forgotPassword:
 *   post:
 *     summary: Demande de réinitialisation de mot de passe (envoi du code par email)
 *     tags: [Authentification]
 *     requestBody:
 *       description: Email de l'utilisateur
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email envoyé si utilisateur trouvé
 *       400:
 *         description: Email invalide
 */

/**
 * @swagger
 * /api/auth/verifyCode:
 *   post:
 *     summary: Vérification du code de réinitialisation
 *     tags: [Authentification]
 *     requestBody:
 *       description: Code reçu par email
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Code vérifié avec succès
 *       400:
 *         description: Code invalide ou expiré
 */

/**
 * @swagger
 * /api/auth/resetPassword/{token}:
 *   post:
 *     summary: Réinitialisation du mot de passe avec token
 *     tags: [Authentification]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de réinitialisation reçu par email
 *     requestBody:
 *       description: Nouveau mot de passe
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: newStrongPassword123
 *               confirmNewPassword:
 *                 type: string
 *                 example: newStrongPassword123
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Token invalide ou expiré
 */

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyCode', verifyCode);
router.post('/resetPassword/:token', resetPassword);

export default router;
