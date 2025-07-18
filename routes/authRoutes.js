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
 *   description: Gestion complète de l'authentification (inscription, connexion, réinitialisation)
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token JWT requis dans le header Authorization "Bearer <token>"
 *   
 *   schemas:
 *     # Schéma de base pour l'utilisateur
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
 *           description: Type de compte utilisateur
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           pattern: "^[a-zA-ZÀ-ÿ\\s-']+$"
 *           description: Prénom de l'utilisateur
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           pattern: "^[a-zA-ZÀ-ÿ\\s-']+$"
 *           description: Nom de famille de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email (utilisée pour la connexion)
 *         phone:
 *           type: string
 *           pattern: "^\\+226[0-9]{8}$"
 *           description: Numéro de téléphone burkinabé
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 128
 *           description: Mot de passe (min 8 caractères, majuscule, minuscule, chiffre)
 *         confirmPassword:
 *           type: string
 *           description: Confirmation du mot de passe (doit correspondre)
 *         termsAccepted:
 *           type: boolean
 *           description: Acceptation des conditions d'utilisation (obligatoire)
 *         receiveOffers:
 *           type: boolean
 *           default: false
 *           description: Consentement pour recevoir des offres commerciales
 *     
 *     # Schéma pour l'adresse client
 *     ClientAddress:
 *       type: object
 *       required:
 *         - arrondissement
 *         - rue
 *         - quartier
 *         - numero
 *         - couleurPorte
 *         - ville
 *         - codePostal
 *       properties:
 *         arrondissement:
 *           type: string
 *           example: "Arrondissement 3"
 *           description: Arrondissement de résidence
 *         rue:
 *           type: string
 *           example: "Rue 14.19"
 *           description: Nom de la rue
 *         quartier:
 *           type: string
 *           example: "Tampouy"
 *           description: Quartier de résidence
 *         numero:
 *           type: string
 *           example: "12"
 *           description: Numéro de la maison/porte
 *         couleurPorte:
 *           type: string
 *           example: "Bleu"
 *           description: Couleur de la porte pour identification
 *         ville:
 *           type: string
 *           example: "Ouagadougou"
 *           description: Ville de résidence
 *         codePostal:
 *           type: string
 *           example: "22600"
 *           description: Code postal
 *     
 *     # Inscription client
 *     ClientRegister:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseUser'
 *         - $ref: '#/components/schemas/ClientAddress'
 *       example:
 *         role: "client"
 *         firstName: "Awa"
 *         lastName: "Ouédraogo"
 *         email: "awa.client@gmail.com"
 *         phone: "+22670123456"
 *         password: "motDePasseFort123"
 *         confirmPassword: "motDePasseFort123"
 *         termsAccepted: true
 *         receiveOffers: false
 *         arrondissement: "Arrondissement 3"
 *         rue: "Rue 14.19"
 *         quartier: "Tampouy"
 *         numero: "12"
 *         couleurPorte: "Bleu"
 *         ville: "Ouagadougou"
 *         codePostal: "22600"
 *     
 *     # Inscription agence
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
 *               minLength: 2
 *               maxLength: 100
 *               description: Nom commercial de l'agence
 *             description:
 *               type: string
 *               minLength: 10
 *               maxLength: 500
 *               description: Description des services de l'agence
 *       example:
 *         role: "agence"
 *         firstName: "Jean"
 *         lastName: "Dupont"
 *         email: "agence@example.com"
 *         phone: "+22670123456"
 *         password: "motDePasseFort123"
 *         confirmPassword: "motDePasseFort123"
 *         termsAccepted: true
 *         receiveOffers: true
 *         name: "Agence Propre"
 *         description: "Collecte des déchets ménagers à Ouagadougou."
 *     
 *     # Connexion utilisateur
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email de connexion
 *         password:
 *           type: string
 *           description: Mot de passe du compte
 *         rememberMe:
 *           type: boolean
 *           default: false
 *           description: Garder la session active plus longtemps
 *       example:
 *         email: "user@example.com"
 *         password: "strongPassword123"
 *         rememberMe: false
 *     
 *     # Réponse de connexion réussie
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Connexion réussie"
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: Token JWT pour l'authentification
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             refreshToken:
 *               type: string
 *               description: Token de rafraîchissement
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "64a1b2c3d4e5f6789012345a"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 role:
 *                   type: string
 *                   example: "client"
 *                 firstName:
 *                   type: string
 *                   example: "Jean"
 *                 lastName:
 *                   type: string
 *                   example: "Dupont"
 *                 isActive:
 *                   type: boolean
 *                   example: true
 *                 lastLogin:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-18T10:30:00.000Z"
 *             expiresIn:
 *               type: string
 *               example: "24h"
 *               description: Durée de validité du token
 *             tokenType:
 *               type: string
 *               example: "Bearer"
 *               description: Type de token
 *     
 *     # Demande de réinitialisation
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email du compte à réinitialiser
 *       example:
 *         email: "user@example.com"
 *     
 *     # Vérification du code
 *     VerifyCodeRequest:
 *       type: object
 *       required:
 *         - code
 *         - email
 *       properties:
 *         code:
 *           type: string
 *           pattern: "^[0-9]{6}$"
 *           description: Code à 6 chiffres reçu par email
 *         email:
 *           type: string
 *           format: email
 *           description: Email associé au code
 *       example:
 *         code: "123456"
 *         email: "user@example.com"
 *     
 *     # Réinitialisation du mot de passe
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - newPassword
 *         - confirmNewPassword
 *       properties:
 *         newPassword:
 *           type: string
 *           minLength: 8
 *           maxLength: 128
 *           description: Nouveau mot de passe
 *         confirmNewPassword:
 *           type: string
 *           description: Confirmation du nouveau mot de passe
 *       example:
 *         newPassword: "newStrongPassword123"
 *         confirmNewPassword: "newStrongPassword123"
 *     
 *     # Réponse de succès standard
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Opération réussie"
 *         data:
 *           type: object
 *           description: Données supplémentaires si nécessaire
 *     
 *     # Réponse d'erreur
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Une erreur s'est produite"
 *         error:
 *           type: string
 *           example: "Détails de l'erreur"
 *         code:
 *           type: string
 *           example: "ERROR_CODE"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2025-07-18T10:30:00.000Z"
 *
 * paths:
 *   /api/auth/register:
 *     post:
 *       summary: Inscription d'un nouvel utilisateur
 *       description: |
 *         Permet l'inscription d'un nouveau compte utilisateur (client ou agence).
 *         
 *         **Types de comptes supportés :**
 *         - **Client** : Particulier souhaitant bénéficier des services de collecte
 *         - **Agence** : Entreprise de collecte de déchets
 *         
 *         **Validation requise :**
 *         - Email unique dans le système
 *         - Mot de passe sécurisé (min 8 caractères)
 *         - Acceptation des conditions d'utilisation
 *         - Numéro de téléphone burkinabé valide
 *       tags: [Authentification]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ClientRegister'
 *                 - $ref: '#/components/schemas/AgenceRegister'
 *               discriminator:
 *                 propertyName: role
 *             examples:
 *               client:
 *                 summary: Inscription client
 *                 description: Exemple d'inscription pour un client particulier
 *                 value:
 *                   role: "client"
 *                   firstName: "Awa"
 *                   lastName: "Ouédraogo"
 *                   email: "awa.client@gmail.com"
 *                   phone: "+22670123456"
 *                   password: "motDePasseFort123"
 *                   confirmPassword: "motDePasseFort123"
 *                   termsAccepted: true
 *                   receiveOffers: false
 *                   arrondissement: "Arrondissement 3"
 *                   rue: "Rue 14.19"
 *                   quartier: "Tampouy"
 *                   numero: "12"
 *                   couleurPorte: "Bleu"
 *                   ville: "Ouagadougou"
 *                   codePostal: "22600"
 *               agence:
 *                 summary: Inscription agence
 *                 description: Exemple d'inscription pour une agence de collecte
 *                 value:
 *                   role: "agence"
 *                   firstName: "Jean"
 *                   lastName: "Dupont"
 *                   email: "agence@example.com"
 *                   phone: "+22670123456"
 *                   password: "motDePasseFort123"
 *                   confirmPassword: "motDePasseFort123"
 *                   termsAccepted: true
 *                   receiveOffers: true
 *                   name: "Agence Propre"
 *                   description: "Collecte des déchets ménagers à Ouagadougou."
 *       responses:
 *         '201':
 *           description: Inscription réussie
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                   - $ref: '#/components/schemas/SuccessResponse'
 *                   - type: object
 *                     properties:
 *                       data:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6789012345a"
 *                           email:
 *                             type: string
 *                             example: "user@example.com"
 *                           role:
 *                             type: string
 *                             example: "client"
 *               example:
 *                 success: true
 *                 message: "Inscription réussie. Un email de vérification a été envoyé."
 *                 data:
 *                   userId: "64a1b2c3d4e5f6789012345a"
 *                   email: "awa.client@gmail.com"
 *                   role: "client"
 *         '400':
 *           description: Données invalides
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                   - $ref: '#/components/schemas/ErrorResponse'
 *                   - type: object
 *                     properties:
 *                       validationErrors:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             field:
 *                               type: string
 *                             message:
 *                               type: string
 *               example:
 *                 success: false
 *                 message: "Données d'inscription invalides"
 *                 error: "Erreurs de validation détectées"
 *                 code: "VALIDATION_ERROR"
 *                 validationErrors:
 *                   - field: "email"
 *                     message: "Cette adresse email est déjà utilisée"
 *                   - field: "password"
 *                     message: "Le mot de passe doit contenir au moins 8 caractères"
 *         '409':
 *           description: Conflit - Email déjà utilisé
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Email déjà utilisé"
 *                 error: "Un compte existe déjà avec cette adresse email"
 *                 code: "EMAIL_ALREADY_EXISTS"
 *         '500':
 *           description: Erreur serveur
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *   
 *   /api/auth/login:
 *     post:
 *       summary: Connexion utilisateur
 *       description: |
 *         Authentifie un utilisateur et retourne un token JWT pour l'accès aux ressources protégées.
 *         
 *         **Processus de connexion :**
 *         1. Validation des identifiants (email/mot de passe)
 *         2. Vérification du statut du compte (actif/inactif)
 *         3. Génération du token JWT et refresh token
 *         4. Mise à jour de la date de dernière connexion
 *         
 *         **Sécurité :**
 *         - Limitation du nombre de tentatives de connexion
 *         - Chiffrement des mots de passe avec bcrypt
 *         - Tokens JWT avec expiration configurable
 *         - Support du "Remember Me" pour sessions étendues
 *       tags: [Authentification]
 *       requestBody:
 *         required: true
 *         description: Identifiants de connexion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginRequest'
 *             examples:
 *               basic_login:
 *                 summary: Connexion standard
 *                 value:
 *                   email: "user@example.com"
 *                   password: "strongPassword123"
 *               remember_me:
 *                 summary: Connexion avec "Se souvenir de moi"
 *                 value:
 *                   email: "user@example.com"
 *                   password: "strongPassword123"
 *                   rememberMe: true
 *       responses:
 *         '200':
 *           description: Connexion réussie
 *           headers:
 *             Set-Cookie:
 *               description: Cookie de session (si rememberMe activé)
 *               schema:
 *                 type: string
 *                 example: "refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict"
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/LoginResponse'
 *         '400':
 *           description: Données de connexion invalides
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Données de connexion invalides"
 *                 error: "Email ou mot de passe manquant"
 *                 code: "INVALID_CREDENTIALS_FORMAT"
 *         '401':
 *           description: Authentification échouée
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               examples:
 *                 wrong_credentials:
 *                   summary: Identifiants incorrects
 *                   value:
 *                     success: false
 *                     message: "Email ou mot de passe incorrect"
 *                     error: "Les identifiants fournis ne correspondent à aucun compte"
 *                     code: "INVALID_CREDENTIALS"
 *                 account_locked:
 *                   summary: Compte verrouillé
 *                   value:
 *                     success: false
 *                     message: "Compte temporairement verrouillé"
 *                     error: "Trop de tentatives de connexion échouées"
 *                     code: "ACCOUNT_LOCKED"
 *                 account_inactive:
 *                   summary: Compte inactif
 *                   value:
 *                     success: false
 *                     message: "Compte inactif"
 *                     error: "Votre compte a été désactivé. Contactez l'administrateur"
 *                     code: "ACCOUNT_INACTIVE"
 *         '429':
 *           description: Trop de tentatives de connexion
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                   - $ref: '#/components/schemas/ErrorResponse'
 *                   - type: object
 *                     properties:
 *                       retryAfter:
 *                         type: integer
 *                         description: Temps d'attente en secondes avant nouvelle tentative
 *               example:
 *                 success: false
 *                 message: "Trop de tentatives de connexion"
 *                 error: "Veuillez patienter avant de réessayer"
 *                 code: "TOO_MANY_ATTEMPTS"
 *                 retryAfter: 300
 *         '500':
 *           description: Erreur serveur
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *   
 *   /api/auth/logout:
 *     post:
 *       summary: Déconnexion sécurisée
 *       description: |
 *         Déconnecte l'utilisateur en invalidant son token JWT et en supprimant les cookies de session.
 *         
 *         **Actions effectuées :**
 *         - Invalidation du token JWT actuel
 *         - Suppression du refresh token
 *         - Nettoyage des cookies de session
 *         - Mise à jour des logs de connexion
 *       tags: [Authentification]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
 *           description: Déconnexion réussie
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 success: true
 *                 message: "Déconnexion réussie"
 *                 data:
 *                   logoutTime: "2025-07-18T10:30:00.000Z"
 *         '401':
 *           description: Token manquant ou invalide
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Token d'authentification requis"
 *                 error: "Aucun token fourni ou token invalide"
 *                 code: "UNAUTHORIZED"
 *         '500':
 *           description: Erreur serveur
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *   
 *   /api/auth/forgotPassword:
 *     post:
 *       summary: Demande de réinitialisation de mot de passe
 *       description: |
 *         Initie le processus de réinitialisation du mot de passe en envoyant un code de vérification par email.
 *         
 *         **Processus :**
 *         1. Vérification de l'existence du compte
 *         2. Génération d'un code de vérification à 6 chiffres
 *         3. Envoi du code par email
 *         4. Stockage temporaire du code (expiration 15 minutes)
 *         
 *         **Sécurité :**
 *         - Limitation du nombre de demandes par IP
 *         - Codes expirés automatiquement après 15 minutes
 *         - Pas de révélation si l'email existe ou non
 *       tags: [Authentification]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPasswordRequest'
 *       responses:
 *         '200':
 *           description: Demande traitée (email envoyé si compte trouvé)
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 success: true
 *                 message: "Si cette adresse email existe, un code de vérification a été envoyé."
 *                 data:
 *                   expiresIn: "15 minutes"
 *         '400':
 *           description: Email invalide
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Format d'email invalide"
 *                 error: "L'adresse email fournie n'est pas valide"
 *                 code: "INVALID_EMAIL_FORMAT"
 *         '429':
 *           description: Trop de demandes
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Trop de demandes de réinitialisation"
 *                 error: "Veuillez patienter avant de faire une nouvelle demande"
 *                 code: "TOO_MANY_REQUESTS"
 *         '500':
 *           description: Erreur serveur
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *   
 *   /api/auth/verifyCode:
 *     post:
 *       summary: Vérification du code de réinitialisation
 *       description: |
 *         Vérifie le code de vérification envoyé par email et génère un token de réinitialisation.
 *         
 *         **Validation :**
 *         - Code à 6 chiffres valide
 *         - Code non expiré (15 minutes max)
 *         - Email correspondant au code
 *         
 *         **Résultat :**
 *         - Token de réinitialisation valide 1 heure
 *         - Invalidation du code utilisé
 *       tags: [Authentification]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyCodeRequest'
 *       responses:
 *         '200':
 *           description: Code vérifié avec succès
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                   - $ref: '#/components/schemas/SuccessResponse'
 *                   - type: object
 *                     properties:
 *                       data:
 *                         type: object
 *                         properties:
 *                           resetToken:
 *                             type: string
 *                             description: Token pour réinitialiser le mot de passe
 *                           expiresIn:
 *                             type: string
 *                             description: Durée de validité du token
 *               example:
 *                 success: true
 *                 message: "Code vérifié avec succès"
 *                 data:
 *                   resetToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   expiresIn: "1 heure"
 *         '400':
 *           description: Code invalide ou expiré
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               examples:
 *                 invalid_code:
 *                   summary: Code incorrect
 *                   value:
 *                     success: false
 *                     message: "Code de vérification invalide"
 *                     error: "Le code fourni est incorrect"
 *                     code: "INVALID_CODE"
 *                 expired_code:
 *                   summary: Code expiré
 *                   value:
 *                     success: false
 *                     message: "Code de vérification expiré"
 *                     error: "Le code a expiré, veuillez faire une nouvelle demande"
 *                     code: "EXPIRED_CODE"
 *         '500':
 *           description: Erreur serveur
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *   
 *   /api/auth/resetPassword:
 *     post:
 *       summary: Réinitialisation du mot de passe
 *       description: |
 *         Finalise la réinitialisation du mot de passe en utilisant le token de réinitialisation.
 *         
 *         **Prérequis :**
 *         - Token de réinitialisation valide (obtenu après vérification du code)
 *         - Nouveau mot de passe respectant les critères de sécurité
 *         
 *         **Actions effectuées :**
 *         - Validation du token de réinitialisation
 *         - Chiffrement du nouveau mot de passe
 *         - Mise à jour du mot de passe en base
 *         - Invalidation du token de réinitialisation
 *         - Invalidation de toutes les sessions actives
 *       tags: [Authentification]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResetPasswordRequest'
 *       responses:
 *         '200':
 *           description: Mot de passe réinitialisé avec succès
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/SuccessResponse'
 *               example:
 *                 success: true
 *                 message: "Mot de passe réinitialisé avec succès"
 *                 data:
 *                   passwordChangedAt: "2025-07-18T10:30:00.000Z"
 *         '400':
 *           description: Données invalides
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               examples:
 *                 weak_password:
 *                   summary: Mot de passe trop faible
 *                   value:
 *                     success: false
 *                     message: "Mot de passe non conforme"
 *                     error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
 *                     code: "WEAK_PASSWORD"
 *                 passwords_mismatch:
 *                   summary: Confirmation incorrecte
 *                   value:
 *                     success: false
 *                     message: "Mots de passe non identiques"
 *                     error: "La confirmation ne correspond pas au nouveau mot de passe"
 *                     code: "PASSWORDS_MISMATCH"
 *         '401':
 *           description: Token de réinitialisation invalide ou expiré
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               examples:
 *                 invalid_token:
 *                   summary: Token invalide
 *                   value:
 *                     success: false
 *                     message: "Token de réinitialisation invalide"
 *                     error: "Le token fourni n'est pas valide"
 *                     code: "INVALID_RESET_TOKEN"
 *                 expired_token:
 *                   summary: Token expiré
 *                   value:
 *                     success: false
 *                     message: "Token de réinitialisation expiré"
 *                     error: "Le token a expiré, veuillez refaire une demande de réinitialisation"
 *                     code: "EXPIRED_RESET_TOKEN"
 *         '500':
 *           description: Erreur serveur
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 */

// Routes d'authentification
router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware(), logout);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyCode', verifyCode);
router.post('/resetPassword', authMiddleware, resetPassword);

export default router;