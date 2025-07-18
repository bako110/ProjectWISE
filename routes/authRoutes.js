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
 *     summary: Inscription d'un nouvel utilisateur (client ou agence)
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/ClientRegister'
 *               - $ref: '#/components/schemas/AgenceRegister'
 *           examples:
 *             client:
 *               summary: Exemple client
 *               value:
 *                 role: client
 *                 firstName: Awa
 *                 lastName: Ouédraogo
 *                 email: awa.client@gmail.com
 *                 phone: "+22670123456"
 *                 password: motDePasseFort123
 *                 confirmPassword: motDePasseFort123
 *                 termsAccepted: true
 *                 receiveOffers: false
 *                 arrondissement: Arrondissement 3
 *                 rue: Rue 14.19
 *                 quartier: Tampouy
 *                 numero: "12"
 *                 couleurPorte: Bleu
 *                 ville: Ouagadougou
 *                 codePostal: "22600"
 *             agence:
 *               summary: Exemple agence
 *               value:
 *                 role: agence
 *                 firstName: Jean
 *                 lastName: Dupont
 *                 email: agence@example.com
 *                 phone: "+22670123456"
 *                 password: motDePasseFort123
 *                 confirmPassword: motDePasseFort123
 *                 termsAccepted: true
 *                 receiveOffers: true
 *                 name: Agence Propre
 *                 description: Collecte des déchets ménagers à Ouagadougou.
 *     responses:
 *       201:
 *         description: Utilisateur inscrit avec succès
 *       400:
 *         description: Données invalides ou consentement manquant
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BaseUser:
 *       type: object
 *       required:
 *         - role
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - confirmPassword
 *         - termsAccepted
 *       properties:
 *         role:
 *           type: string
 *           enum: [client, agence]
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         password:
 *           type: string
 *         confirmPassword:
 *           type: string
 *         termsAccepted:
 *           type: boolean
 *         receiveOffers:
 *           type: boolean
 *     ClientRegister:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseUser'
 *         - type: object
 *           required:
 *             - arrondissement
 *             - rue
 *             - quartier
 *             - numero
 *             - couleurPorte
 *             - ville
 *             - codePostal
 *           properties:
 *             arrondissement:
 *               type: string
 *             rue:
 *               type: string
 *             quartier:
 *               type: string
 *             numero:
 *               type: string
 *             couleurPorte:
 *               type: string
 *             ville:
 *               type: string
 *             codePostal:
 *               type: string
 *     AgenceRegister:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseUser'
 *         - type: object
 *           required:
 *             - name
 *             - description
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
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


// Alias pour Swagger UI
['client', 'agence', 'mairie'].forEach(role => {
  router.post(`/register/${role}`, (req, res) => register(req, res));
});

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware(), logout);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyCode', verifyCode);
router.post('/resetPassword/:token', resetPassword);

export default router;
