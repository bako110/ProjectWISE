const express = require('express');
const { register } = require('../controllers/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegistration:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - email
 *         - password
 *         - phone
 *       properties:
 *         firstname:
 *           type: string
 *           example: "John"
 *         lastname:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: "password123"
 *         phone:
 *           type: string
 *           example: "+33123456789"
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 * 
 *     ClientRegistration:
 *       allOf:
 *         - $ref: '#/components/schemas/UserRegistration'
 *         - type: object
 *           properties:
 *             role:
 *               type: string
 *               enum: [client]
 *               example: "client"
 * 
 *     AgencyRegistration:
 *       allOf:
 *         - $ref: '#/components/schemas/UserRegistration'
 *         - type: object
 *           required:
 *             - clientId
 *             - collectorId
 *           properties:
 *             role:
 *               type: string
 *               enum: [agency]
 *               example: "agency"
 *             name:
 *               type: string
 *               example: "Mon Agence"
 *             agencyName:
 *               type: string
 *               example: "Agence Paris Nord"
 *             agencyDescription:
 *               type: string
 *               example: "Description de l'agence"
 *             zoneActivite:
 *               type: string
 *               example: "Paris et banlieue"
 *             slogan:
 *               type: string
 *               example: "Votre partenaire de confiance"
 *             clientId:
 *               type: string
 *               format: objectid
 *               example: "507f1f77bcf86cd799439011"
 *             collectorId:
 *               type: string
 *               format: objectid
 *               example: "507f1f77bcf86cd799439012"
 * 
 *     CollectorRegistration:
 *       allOf:
 *         - $ref: '#/components/schemas/UserRegistration'
 *         - type: object
 *           required:
 *             - agencyId
 *           properties:
 *             role:
 *               type: string
 *               enum: [collector]
 *               example: "collector"
 *             agencyId:
 *               type: string
 *               format: objectid
 *               example: "507f1f77bcf86cd799439013"
 *             planning:
 *               type: string
 *               example: "Lundi-Vendredi 8h-18h"
 *             collection:
 *               type: string
 *               example: "Collecte sélective"
 * 
 *     ManagerRegistration:
 *       allOf:
 *         - $ref: '#/components/schemas/UserRegistration'
 *         - type: object
 *           required:
 *             - agencyId
 *           properties:
 *             role:
 *               type: string
 *               enum: [manager]
 *               example: "manager"
 *             agencyId:
 *               type: string
 *               format: objectid
 *               example: "507f1f77bcf86cd799439013"
 *             nbManager:
 *               type: integer
 *               minimum: 1
 *               example: 1
 *             activity:
 *               type: string
 *               example: "Gestion des équipes"
 * 
 *     MunicipalityRegistration:
 *       allOf:
 *         - $ref: '#/components/schemas/UserRegistration'
 *         - type: object
 *           required:
 *             - municipalityCode
 *           properties:
 *             role:
 *               type: string
 *               enum: [municipality]
 *               example: "municipality"
 *             municipalityCode:
 *               type: string
 *               example: "75056"
 *             region:
 *               type: string
 *               example: "Île-de-France"
 * 
 *     AdminRegistration:
 *       allOf:
 *         - $ref: '#/components/schemas/UserRegistration'
 *         - type: object
 *           properties:
 *             role:
 *               type: string
 *               enum: [super_admin]
 *               example: "super_admin"
 *             adminLevel:
 *               type: string
 *               enum: [super, admin, moderator]
 *               example: "super"
 *             permissions:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["users:read", "users:write"]
 * 
 *     RegistrationSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Inscription client réussie"
 *         data:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             roleId:
 *               type: string
 *               example: "507f1f77bcf86cd799439012"
 *             firstname:
 *               type: string
 *               example: "John"
 *             lastname:
 *               type: string
 *               example: "Doe"
 *             email:
 *               type: string
 *               example: "john.doe@example.com"
 *             phone:
 *               type: string
 *               example: "+33123456789"
 *             role:
 *               type: string
 *               example: "client"
 *             status:
 *               type: string
 *               example: "active"
 *             # Champs spécifiques selon le rôle
 *             qrCode:
 *               type: string
 *               example: "CLIENT-1640995200000-abc123def"
 *             qrCodeImage:
 *               type: string
 *               format: byte
 *               example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
 *             agencyName:
 *               type: string
 *               example: "Éco Collecte Paris"
 *             agencyId:
 *               type: string
 *               example: "507f1f77bcf86cd799439013"
 *             municipalityCode:
 *               type: string
 *               example: "75056"
 *             adminLevel:
 *               type: string
 *               example: "super"
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         error:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Gestion de l'authentification et de l'inscription
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: |
 *       🎯 **POINT D'ENTRÉE UNIQUE** - Inscription avec validation stricte
 *       
 *       **Règles de validation :**
 *       - Tous les rôles doivent être explicitement définis
 *       - Aucun rôle par défaut (plus de "client" automatique)
 *       - Vérification des dépendances entre tables
 *       - QR Code généré uniquement pour les clients
 *       
 *       **Rôles supportés :** client, agency, collector, manager, municipality, super_admin
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/ClientRegistration'
 *               - $ref: '#/components/schemas/AgencyRegistration'
 *               - $ref: '#/components/schemas/CollectorRegistration'
 *               - $ref: '#/components/schemas/ManagerRegistration'
 *               - $ref: '#/components/schemas/MunicipalityRegistration'
 *               - $ref: '#/components/schemas/AdminRegistration'
 *           examples:
 *             client:
 *               summary: Inscription Client (avec QR Code)
 *               value:
 *                 firstname: "Alice"
 *                 lastname: "Martin"
 *                 email: "alice.martin@example.com"
 *                 password: "password123"
 *                 phone: "+33123456789"
 *                 role: "client"
 *             agency:
 *               summary: Inscription Agence
 *               value:
 *                 firstname: "Pierre"
 *                 lastname: "Durand"
 *                 email: "pierre@agence-eco.fr"
 *                 password: "password123"
 *                 phone: "+33123456790"
 *                 role: "agency"
 *                 agencyName: "Éco Collecte Paris"
 *                 name: "Éco Collecte"
 *                 zoneActivite: "Paris intra-muros"
 *                 slogan: "Vos déchets, notre expertise"
 *                 clientId: "507f1f77bcf86cd799439011"
 *                 collectorId: "507f1f77bcf86cd799439012"
 *             collector:
 *               summary: Inscription Collecteur
 *               value:
 *                 firstname: "Marc"
 *                 lastname: "Leroy"
 *                 email: "marc.leroy@ecocollecte.fr"
 *                 password: "password123"
 *                 phone: "+33123456791"
 *                 role: "collector"
 *                 agencyId: "507f1f77bcf86cd799439013"
 *                 planning: "Lun-Ven 6h-14h"
 *                 collection: "Ordures ménagères"
 *             manager:
 *               summary: Inscription Manager
 *               value:
 *                 firstname: "Sophie"
 *                 lastname: "Moreau"
 *                 email: "sophie.moreau@ecocollecte.fr"
 *                 password: "password123"
 *                 phone: "+33123456792"
 *                 role: "manager"
 *                 agencyId: "507f1f77bcf86cd799439013"
 *                 nbManager: 2
 *                 activity: "Supervision des collectes"
 *             municipality:
 *               summary: Inscription Municipalité
 *               value:
 *                 firstname: "Thomas"
 *                 lastname: "Bernard"
 *                 email: "thomas.bernard@mairie-paris.fr"
 *                 password: "password123"
 *                 phone: "+33123456793"
 *                 role: "municipality"
 *                 municipalityCode: "75056"
 *                 region: "Île-de-France"
 *             super_admin:
 *               summary: Inscription Super Admin
 *               value:
 *                 firstname: "Admin"
 *                 lastname: "System"
 *                 email: "admin@system.fr"
 *                 password: "password123"
 *                 phone: "+33123456794"
 *                 role: "super_admin"
 *                 adminLevel: "super"
 *                 permissions: ["users:read", "users:write", "system:admin"]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationSuccessResponse'
 *             examples:
 *               client_success:
 *                 summary: Réponse pour un client
 *                 value:
 *                   success: true
 *                   message: "Inscription client réussie"
 *                   data:
 *                     userId: "507f1f77bcf86cd799439011"
 *                     roleId: "507f1f77bcf86cd799439012"
 *                     firstname: "Alice"
 *                     lastname: "Martin"
 *                     email: "alice.martin@example.com"
 *                     phone: "+33123456789"
 *                     role: "client"
 *                     status: "active"
 *                     qrCode: "CLIENT-1640995200000-abc123def"
 *                     qrCodeImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
 *               agency_success:
 *                 summary: Réponse pour une agence
 *                 value:
 *                   success: true
 *                   message: "Inscription agency réussie"
 *                   data:
 *                     userId: "507f1f77bcf86cd799439013"
 *                     roleId: "507f1f77bcf86cd799439014"
 *                     firstname: "Pierre"
 *                     lastname: "Durand"
 *                     email: "pierre@agence-eco.fr"
 *                     phone: "+33123456790"
 *                     role: "agency"
 *                     status: "active"
 *                     agencyName: "Éco Collecte Paris"
 *                     agencyId: "507f1f77bcf86cd799439014"
 *                     zoneActivite: "Paris intra-muros"
 *                     clientId: "507f1f77bcf86cd799439011"
 *                     collectorId: "507f1f77bcf86cd799439012"
 *       400:
 *         description: Données invalides ou manquantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 value:
 *                   success: false
 *                   message: "Champs obligatoires manquants: firstname, email"
 *                   error: "Champs obligatoires manquants: firstname, email"
 *                   timestamp: "2024-01-01T12:00:00.000Z"
 *               invalid_role:
 *                 value:
 *                   success: false
 *                   message: "Impossible de déterminer le rôle. Veuillez spécifier un rôle valide ou fournir les champs nécessaires."
 *                   error: "Impossible de déterminer le rôle. Veuillez spécifier un rôle valide ou fournir les champs nécessaires."
 *                   timestamp: "2024-01-01T12:00:00.000Z"
 *       409:
 *         description: Conflit (email déjà utilisé ou dépendances manquantes)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               email_exists:
 *                 value:
 *                   success: false
 *                   message: "Cet email est déjà utilisé"
 *                   error: "Cet email est déjà utilisé"
 *                   timestamp: "2024-01-01T12:00:00.000Z"
 *               dependency_missing:
 *                 value:
 *                   success: false
 *                   message: "L'agence spécifiée n'existe pas"
 *                   error: "L'agence spécifiée n'existe pas"
 *                   timestamp: "2024-01-01T12:00:00.000Z"
 *       422:
 *         description: Rôle non supporté ou données non traitables
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unsupported_role:
 *                 value:
 *                   success: false
 *                   message: "Rôle non supporté: invalid_role"
 *                   error: "Rôle non supporté: invalid_role"
 *                   timestamp: "2024-01-01T12:00:00.000Z"
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server_error:
 *                 value:
 *                   success: false
 *                   message: "Erreur interne du serveur"
 *                   error: "Erreur interne du serveur"
 *                   timestamp: "2024-01-01T12:00:00.000Z"
 */

// POST /api/auth/register
router.post('/register', register);

module.exports = router;