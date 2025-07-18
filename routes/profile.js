import express from 'express';
import { updateProfile } from '../controllers/profileController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profil
 *   description: Gestion des profils utilisateurs selon leur rôle
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
 *     # Schéma pour les coordonnées géographiques
 *     Coordinates:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [Point]
 *           example: Point
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           minItems: 2
 *           maxItems: 2
 *           example: [-0.2297, 5.5557]
 *           description: [longitude, latitude]
 *     
 *     # Schéma pour l'adresse de service client
 *     ServiceAddress:
 *       type: object
 *       properties:
 *         ville:
 *           type: string
 *           example: "Ouagadougou"
 *         arrondissement:
 *           type: string
 *           example: "Baskuy"
 *         secteur:
 *           type: string
 *           example: "Secteur 4"
 *         quartier:
 *           type: string
 *           example: "Gounghin"
 *         rue:
 *           type: string
 *           example: "Avenue Charles de Gaulle"
 *         porte:
 *           type: string
 *           example: "12B"
 *         couleurPorte:
 *           type: string
 *           example: "Bleu"
 *         coordinates:
 *           $ref: '#/components/schemas/Coordinates'
 *     
 *     # Schéma pour l'adresse d'agence
 *     AgencyAddress:
 *       type: object
 *       properties:
 *         street:
 *           type: string
 *           example: "Avenue Kwame Nkrumah"
 *         doorNumber:
 *           type: string
 *           example: "15A"
 *         doorColor:
 *           type: string
 *           example: "Rouge"
 *         neighborhood:
 *           type: string
 *           example: "Patte d'Oie"
 *         city:
 *           type: string
 *           example: "Ouagadougou"
 *         postalCode:
 *           type: string
 *           example: "01 BP 1234"
 *         latitude:
 *           type: number
 *           example: 12.3714
 *         longitude:
 *           type: number
 *           example: -1.5197
 *     
 *     # Schéma pour les zones gérées par les gestionnaires municipaux
 *     ManagedZone:
 *       type: object
 *       properties:
 *         arrondissement:
 *           type: string
 *           example: "Baskuy"
 *         secteur:
 *           type: string
 *           example: "Secteur 4"
 *         quartier:
 *           type: string
 *           example: "Gounghin"
 *         village:
 *           type: string
 *           example: "Tanghin"
 *     
 *     # Schéma pour les informations communales
 *     Commune:
 *       type: object
 *       properties:
 *         region:
 *           type: string
 *           example: "Centre"
 *         province:
 *           type: string
 *           example: "Kadiogo"
 *         name:
 *           type: string
 *           example: "Ouagadougou"
 *     
 *     # Mise à jour profil Client
 *     ClientUpdate:
 *       type: object
 *       description: Données pour la mise à jour du profil client
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Jean"
 *           description: Prénom du client
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Dupont"
 *           description: Nom de famille du client
 *         phone:
 *           type: string
 *           pattern: "^\\+226[0-9]{8}$"
 *           example: "+22670123456"
 *           description: Numéro de téléphone (format burkinabé)
 *         agencyId:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs des agences associées
 *         subscribedAgencyId:
 *           type: string
 *           description: ID de l'agence d'abonnement principal
 *         subscriptionStatus:
 *           type: string
 *           enum: [active, pending, cancelled]
 *           example: "active"
 *           description: Statut de l'abonnement
 *         serviceAddress:
 *           $ref: '#/components/schemas/ServiceAddress'
 *         termsAccepted:
 *           type: boolean
 *           example: true
 *           description: Acceptation des conditions d'utilisation
 *         receiveOffers:
 *           type: boolean
 *           example: false
 *           description: Acceptation de recevoir des offres commerciales
 *     
 *     # Mise à jour profil Agence
 *     AgencyUpdate:
 *       type: object
 *       description: Données pour la mise à jour du profil agence
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "EcoClean Services"
 *           description: Nom de l'agence
 *         description:
 *           type: string
 *           maxLength: 500
 *           example: "Agence spécialisée dans la collecte des déchets ménagers"
 *           description: Description des services de l'agence
 *         phone:
 *           type: string
 *           pattern: "^\\+226[0-9]{8}$"
 *           example: "+22670987654"
 *           description: Numéro de téléphone de l'agence
 *         email:
 *           type: string
 *           format: email
 *           example: "contact@ecoclean.bf"
 *           description: Email de contact de l'agence
 *         logo:
 *           type: string
 *           format: uri
 *           example: "https://example.com/logo.png"
 *           description: URL du logo de l'agence
 *         address:
 *           $ref: '#/components/schemas/AgencyAddress'
 *         serviceZones:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Secteur 1", "Secteur 2", "Secteur 3"]
 *           description: Zones de service couvertes
 *         services:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Collecte ménagère", "Déchets industriels", "Recyclage"]
 *           description: Types de services proposés
 *         employees:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs des employés de l'agence
 *         schedule:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Lundi: 6h-18h", "Mardi: 6h-18h", "Mercredi: 6h-18h"]
 *           description: Horaires de service
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           example: 4.2
 *           description: Note moyenne de l'agence
 *         totalClients:
 *           type: number
 *           minimum: 0
 *           example: 1250
 *           description: Nombre total de clients
 *         termsAccepted:
 *           type: boolean
 *           example: true
 *           description: Acceptation des conditions d'utilisation
 *         receiveOffers:
 *           type: boolean
 *           example: true
 *           description: Acceptation de recevoir des offres commerciales
 *         isActive:
 *           type: boolean
 *           example: true
 *           description: Statut d'activation de l'agence
 *     
 *     # Mise à jour profil Employé
 *     EmployeeUpdate:
 *       type: object
 *       description: Données pour la mise à jour du profil employé
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Marie"
 *           description: Prénom de l'employé
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Ouédraogo"
 *           description: Nom de famille de l'employé
 *         email:
 *           type: string
 *           format: email
 *           example: "marie.ouedraogo@ecoclean.bf"
 *           description: Email professionnel
 *         phone:
 *           type: string
 *           pattern: "^\\+226[0-9]{8}$"
 *           example: "+22675555555"
 *           description: Numéro de téléphone
 *         agencyId:
 *           type: string
 *           description: ID de l'agence employeur
 *         role:
 *           type: string
 *           enum: [manager, collector]
 *           example: "collector"
 *           description: Rôle de l'employé dans l'agence
 *         zones:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Secteur 1", "Secteur 2"]
 *           description: Zones d'intervention de l'employé
 *         isActive:
 *           type: boolean
 *           example: true
 *           description: Statut d'activation du compte employé
 *         hiredAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-15T00:00:00.000Z"
 *           description: Date d'embauche
 *         avatar:
 *           type: string
 *           format: uri
 *           example: "https://example.com/avatar.jpg"
 *           description: URL de la photo de profil
 *     
 *     # Mise à jour profil Gestionnaire Municipal
 *     MunicipalManagerUpdate:
 *       type: object
 *       description: Données pour la mise à jour du profil gestionnaire municipal
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Abdoul"
 *           description: Prénom du gestionnaire
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Traoré"
 *           description: Nom de famille du gestionnaire
 *         name:
 *           type: string
 *           maxLength: 100
 *           example: "Abdoul Traoré"
 *           description: Nom complet d'affichage
 *         phone:
 *           type: string
 *           pattern: "^\\+226[0-9]{8}$"
 *           example: "+22676666666"
 *           description: Numéro de téléphone officiel
 *         agencyId:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs des agences supervisées
 *         commune:
 *           $ref: '#/components/schemas/Commune'
 *         managedZones:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ManagedZone'
 *           description: Zones géographiques sous supervision
 *         position:
 *           type: string
 *           example: "Maire"
 *           description: Poste occupé dans l'administration
 *     
 *     # Mise à jour profil Admin
 *     AdminUpdate:
 *       type: object
 *       description: Données pour la mise à jour du profil administrateur
 *       properties:
 *         firstname:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Fatou"
 *           description: Prénom de l'administrateur
 *         lastname:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Kaboré"
 *           description: Nom de famille de l'administrateur
 *         phone:
 *           type: string
 *           pattern: "^\\+226[0-9]{8}$"
 *           example: "+22677777777"
 *           description: Numéro de téléphone
 *         isActive:
 *           type: boolean
 *           example: true
 *           description: Statut d'activation du compte administrateur
 *     
 *     # Mise à jour profil Super Admin
 *     SuperAdminUpdate:
 *       type: object
 *       description: Mise à jour directe des données utilisateur (réservé aux super admins)
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "superadmin@wastemanagement.bf"
 *           description: Email de connexion
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "NewSecurePassword123!"
 *           description: Nouveau mot de passe (minimum 8 caractères)
 *         isActive:
 *           type: boolean
 *           example: true
 *           description: Statut d'activation du compte
 *     
 *     # Réponse de succès
 *     ProfileUpdateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Profil mis à jour avec succès"
 *         data:
 *           type: object
 *           properties:
 *             profile:
 *               type: object
 *               description: Profil utilisateur mis à jour
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: "2025-07-18T10:30:00.000Z"
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
 *           example: "PROFILE_UPDATE_ERROR"
 *
 * paths:
 *   /api/profile/{userId}:
 *     put:
 *       summary: Mise à jour du profil utilisateur
 *       description: |
 *         Met à jour le profil d'un utilisateur en fonction de son rôle.
 *         
 *         **Rôles supportés :**
 *         - **Client** : Mise à jour des informations personnelles et d'adresse
 *         - **Agency** : Gestion des informations d'agence, services et zones
 *         - **Employee** : Profil employé avec zones d'intervention
 *         - **Municipal Manager** : Gestionnaire municipal avec zones supervisées
 *         - **Admin** : Administrateur système
 *         - **Super Admin** : Super administrateur avec accès aux données sensibles
 *         
 *         **Authentification requise :** Token JWT Bearer
 *       tags: [Profil]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: userId
 *           required: true
 *           schema:
 *             type: string
 *             pattern: "^[a-fA-F0-9]{24}$"
 *           description: ID MongoDB de l'utilisateur à mettre à jour
 *           example: "64a1b2c3d4e5f6789012345a"
 *       requestBody:
 *         required: true
 *         description: Données de mise à jour selon le rôle de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ClientUpdate'
 *                 - $ref: '#/components/schemas/AgencyUpdate'
 *                 - $ref: '#/components/schemas/EmployeeUpdate'
 *                 - $ref: '#/components/schemas/MunicipalManagerUpdate'
 *                 - $ref: '#/components/schemas/AdminUpdate'
 *                 - $ref: '#/components/schemas/SuperAdminUpdate'
 *               discriminator:
 *                 propertyName: userRole
 *             examples:
 *               Client:
 *                 summary: Mise à jour profil client
 *                 value:
 *                   firstName: "Jean"
 *                   lastName: "Dupont"
 *                   phone: "+22670123456"
 *                   serviceAddress:
 *                     ville: "Ouagadougou"
 *                     arrondissement: "Baskuy"
 *                     secteur: "Secteur 4"
 *                     quartier: "Gounghin"
 *                     rue: "Avenue Charles de Gaulle"
 *                     porte: "12B"
 *                     couleurPorte: "Bleu"
 *                   termsAccepted: true
 *                   receiveOffers: false
 *               Agency:
 *                 summary: Mise à jour profil agence
 *                 value:
 *                   name: "EcoClean Services"
 *                   description: "Agence spécialisée dans la collecte des déchets"
 *                   phone: "+22670987654"
 *                   email: "contact@ecoclean.bf"
 *                   serviceZones: ["Secteur 1", "Secteur 2"]
 *                   services: ["Collecte ménagère", "Recyclage"]
 *                   isActive: true
 *       responses:
 *         '200':
 *           description: Profil mis à jour avec succès
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ProfileUpdateResponse'
 *         '400':
 *           description: Données invalides ou rôle inconnu
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Rôle utilisateur non reconnu"
 *                 error: "Le rôle fourni n'est pas supporté par cette API"
 *                 code: "INVALID_USER_ROLE"
 *         '401':
 *           description: Token d'authentification manquant ou invalide
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Authentification requise"
 *                 error: "Token JWT manquant ou invalide"
 *                 code: "UNAUTHORIZED"
 *         '403':
 *           description: Permissions insuffisantes
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Accès refusé"
 *                 error: "Vous n'avez pas les permissions nécessaires"
 *                 code: "FORBIDDEN"
 *         '404':
 *           description: Utilisateur ou profil non trouvé
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Utilisateur non trouvé"
 *                 error: "Aucun utilisateur trouvé avec cet ID"
 *                 code: "USER_NOT_FOUND"
 *         '422':
 *           description: Erreur de validation des données
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
 *                 message: "Erreurs de validation"
 *                 error: "Les données fournies ne respectent pas le format requis"
 *                 code: "VALIDATION_ERROR"
 *                 validationErrors:
 *                   - field: "phone"
 *                     message: "Le numéro de téléphone doit être au format burkinabé"
 *                   - field: "email"
 *                     message: "Format d'email invalide"
 *         '500':
 *           description: Erreur interne du serveur
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: "Erreur interne du serveur"
 *                 error: "Une erreur inattendue s'est produite"
 *                 code: "INTERNAL_SERVER_ERROR"
 */

router.put('/profile/:userId', authMiddleware(), updateProfile);

export default router;