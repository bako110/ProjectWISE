const express = require('express');
const router = express.Router();

const {  
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyResetCode,
  getProfile
} = require('../controllers/auth.js');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Routes pour l'authentification et la gestion des utilisateurs
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/User'
 *               - type: object
 *                 properties:
 *                   agency:
 *                     $ref: '#/components/schemas/Agence'
 *     responses:
 *       201:
 *         description: Utilisateur enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation ou données manquantes
 *       500:
 *         description: Erreur interne du serveur
 * 
 * /api/login:
 *   post:
 *     summary: Authentifier un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *                 description: 'email ou phone'
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "yourpassword"
 *     responses:
 *       200:
 *         description: Utilisateur authentifier avec succès
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  description: Jeton d'authentification
 *                user:
 *                  $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation ou données manquantes
 *       401:
 *         description: Identifiant ou mot de passe incorrect
 *       500:
 *         description: Erreur interne du serveur
 */

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Demander une réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Email avec le code de réinitialisation envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email de réinitialisation envoyé"
 *       400:
 *         description: Email manquant ou utilisateur non trouvé
 *       500:
 *         description: Erreur lors de l'envoi de l'email
 * 
 * /api/verify-reset-code:
 *   post:
 *     summary: Vérifier la validité d'un code de réinitialisation
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Code à 6 chiffres reçu par email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Code valide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 sessionToken:
 *                   type: string
 *                   description: Token de session pour la réinitialisation
 *                   example: "abc123def456"
 *       400:
 *         description: Code invalide ou expiré
 *       500:
 *         description: Erreur interne du serveur
 * 
 * /api/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe avec un token d'autorisation
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: x-reset-token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de session reçu après vérification du code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: Nouveau mot de passe
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mot de passe réinitialisé avec succès"
 *       400:
 *         description: Token manquant, invalide, expiré ou mot de passe manquant
 *       500:
 *         description: Erreur interne du serveur
 * 
 * /api/profile/{userId}:
 *   get:
 *     summary: Récupérer le profil d'un utilisateur
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Profil trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Utilisateur non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *        description: Erreur interne du serveur
 */


// Routes d'authentification
router.post('/register', register);
router.post('/login', login);

// Routes de mot de passe perdu avec code à 6 chiffres
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.get('/profile/:userId', getProfile);


module.exports = router;