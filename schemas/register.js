// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     Address:
//  *       type: object
//  *       properties:
//  *         street:
//  *           type: string
//  *           description: Rue ou nom de la voie
//  *           example: "Rue 14.19"
//  *         doorNumber:
//  *           type: string
//  *           description: Numéro de la porte
//  *           example: "12"
//  *         doorColor:
//  *           type: string
//  *           description: Couleur de la porte (optionnel)
//  *           example: "Bleu"
//  *         sector:
//  *           type: string
//  *           description: Secteur
//  *           example: "Secteur 30"
//  *         neighborhood:
//  *           type: string
//  *           description: Quartier
//  *           example: "Tampouy"
//  *         city:
//  *           type: string
//  *           description: Ville
//  *           example: "Ouagadougou"
//  *         postalCode:
//  *           type: string
//  *           description: Code postal
//  *           example: "22600"
//  *         arrondissement:
//  *           type: string
//  *           description: Arrondissement ou secteur administratif
//  *           example: "Arrondissement 3"
//  *         latitude:
//  *           type: number
//  *           format: float
//  *           description: Latitude GPS (optionnel)
//  *         longitude:
//  *           type: number
//  *           format: float
//  *           description: Longitude GPS (optionnel)
//  * 
//  *     UserRegistration:
//  *       type: object
//  *       required:
//  *         - firstName
//  *         - lastName
//  *         - email
//  *         - password
//  *         - phone
//  *         - acceptTerms
//  *         - role
//  *       properties:
//  *         firstName:
//  *           type: string
//  *           example: "John"
//  *         lastName:
//  *           type: string
//  *           example: "Doe"
//  *         email:
//  *           type: string
//  *           format: email
//  *           example: "john.doe@example.com"
//  *         password:
//  *           type: string
//  *           format: password
//  *           minLength: 6
//  *           example: "motDePasseFort123"
//  *         phone:
//  *           type: string
//  *           example: "+22670123456"
//  *         role:
//  *           type: string
//  *           enum: [client, agence, collector, manager, municipality, super_admin]
//  *           example: "client"
//  *         acceptTerms:
//  *           type: boolean
//  *           example: true
//  *         receiveOffers:
//  *           type: boolean
//  *           example: false
//  *         address:
//  *           $ref: '#/components/schemas/Address'
//  * 
//  *     ClientRegistration:
//  *       allOf:
//  *         - $ref: '#/components/schemas/UserRegistration'
//  *         - type: object
//  *           properties:
//  *             role:
//  *               type: string
//  *               enum: [client]
//  *               example: "client"
//  * 
//  *     AgencyRegistration:
//  *       allOf:
//  *         - $ref: '#/components/schemas/UserRegistration'
//  *         - type: object
//  *           required:
//  *             - agencyName
//  *             - agencyDescription
//  *           properties:
//  *             role:
//  *               type: string
//  *               enum: [agence]
//  *               example: "agence"
//  *             agencyName:
//  *               type: string
//  *               example: "Agence Propreté Faso"
//  *             agencyDescription:
//  *               type: string
//  *               example: "Entreprise spécialisée dans la collecte des déchets."
//  * 
//  *     CollectorRegistration:
//  *       allOf:
//  *         - $ref: '#/components/schemas/UserRegistration'
//  *         - type: object
//  *           required:
//  *             - agencyId
//  *           properties:
//  *             role:
//  *               type: string
//  *               enum: [collector]
//  *               example: "collector"
//  *             agencyId:
//  *               type: string
//  *               format: objectid
//  *               example: "507f1f77bcf86cd799439013"
//  *             planning:
//  *               type: string
//  *               example: "Lundi-Vendredi 8h-18h"
//  *             collection:
//  *               type: string
//  *               example: "Collecte sélective"
//  * 
//  *     ManagerRegistration:
//  *       allOf:
//  *         - $ref: '#/components/schemas/UserRegistration'
//  *         - type: object
//  *           required:
//  *             - agencyId
//  *           properties:
//  *             role:
//  *               type: string
//  *               enum: [manager]
//  *               example: "manager"
//  *             agencyId:
//  *               type: string
//  *               format: objectid
//  *               example: "507f1f77bcf86cd799439013"
//  *             nbManager:
//  *               type: integer
//  *               minimum: 1
//  *               example: 1
//  *             activity:
//  *               type: string
//  *               example: "Gestion des équipes"
//  * 
//  *     MunicipalityRegistration:
//  *       allOf:
//  *         - $ref: '#/components/schemas/UserRegistration'
//  *         - type: object
//  *           required:
//  *             - municipalityCode
//  *           properties:
//  *             role:
//  *               type: string
//  *               enum: [municipality]
//  *               example: "municipality"
//  *             municipalityCode:
//  *               type: string
//  *               example: "75056"
//  *             region:
//  *               type: string
//  *               example: "Île-de-France"
//  * 
//  *     AdminRegistration:
//  *       allOf:
//  *         - $ref: '#/components/schemas/UserRegistration'
//  *         - type: object
//  *           properties:
//  *             role:
//  *               type: string
//  *               enum: [super_admin]
//  *               example: "super_admin"
//  *             adminLevel:
//  *               type: string
//  *               enum: [super, admin, moderator]
//  *               example: "super"
//  *             permissions:
//  *               type: array
//  *               items:
//  *                 type: string
//  *               example: ["users:read", "users:write"]
//  * 
//  *     RegistrationSuccessResponse:
//  *       type: object
//  *       properties:
//  *         success:
//  *           type: boolean
//  *           example: true
//  *         message:
//  *           type: string
//  *           example: "Inscription client réussie"
//  *         data:
//  *           type: object
//  *           properties:
//  *             userId:
//  *               type: string
//  *               example: "507f1f77bcf86cd799439011"
//  *             roleId:
//  *               type: string
//  *               example: "507f1f77bcf86cd799439012"
//  *             firstName:
//  *               type: string
//  *               example: "Awa"
//  *             lastName:
//  *               type: string
//  *               example: "Ouédraogo"
//  *             email:
//  *               type: string
//  *               example: "awa.client@gmail.com"
//  *             phone:
//  *               type: string
//  *               example: "+22670123456"
//  *             role:
//  *               type: string
//  *               example: "client"
//  *             status:
//  *               type: string
//  *               example: "active"
//  *             acceptTerms:
//  *               type: boolean
//  *               example: true
//  *             receiveOffers:
//  *               type: boolean
//  *               example: false
//  *             address:
//  *               $ref: '#/components/schemas/Address'
//  *             # Champs spécifiques selon le rôle
//  *             qrCode:
//  *               type: string
//  *               example: "CLIENT-1640995200000-abc123def"
//  *             qrCodeImage:
//  *               type: string
//  *               format: byte
//  *               example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
//  *             agencyName:
//  *               type: string
//  *               example: "Agence Propreté Faso"
//  *             agencyDescription:
//  *               type: string
//  *               example: "Entreprise spécialisée dans la collecte des déchets."
//  *             agencyId:
//  *               type: string
//  *               example: "507f1f77bcf86cd799439013"
//  *             municipalityCode:
//  *               type: string
//  *               example: "75056"
//  *             adminLevel:
//  *               type: string
//  *               example: "super"
//  * 
//  *     ErrorResponse:
//  *       type: object
//  *       properties:
//  *         success:
//  *           type: boolean
//  *           example: false
//  *         message:
//  *           type: string
//  *         error:
//  *           type: string
//  *         timestamp:
//  *           type: string
//  *           format: date-time
//  * 
//  *   securitySchemes:
//  *     bearerAuth:
//  *       type: http
//  *       scheme: bearer
//  *       bearerFormat: JWT
//  */

// /**
//  * @swagger
//  * tags:
//  *   name: Authentication
//  *   description: Gestion de l'authentification et de l'inscription
//  */

// /**
//  * @swagger
//  * /api/auth/register:
//  *   post:
//  *     summary: Inscription d'un nouvel utilisateur
//  *     description: |
//  *       🎯 **POINT D'ENTRÉE UNIQUE** - Inscription avec validation stricte
//  *       
//  *       **Règles de validation :**
//  *       - Tous les rôles doivent être explicitement définis
//  *       - Aucun rôle par défaut (plus de "client" automatique)
//  *       - Vérification des dépendances entre tables
//  *       - QR Code généré uniquement pour les clients
//  *       - acceptTerms obligatoire pour tous les utilisateurs
//  *       
//  *       **Rôles supportés :** client, agence, collector, manager, municipality, super_admin
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             oneOf:
//  *               - $ref: '#/components/schemas/ClientRegistration'
//  *               - $ref: '#/components/schemas/AgencyRegistration'
//  *               - $ref: '#/components/schemas/CollectorRegistration'
//  *               - $ref: '#/components/schemas/ManagerRegistration'
//  *               - $ref: '#/components/schemas/MunicipalityRegistration'
//  *               - $ref: '#/components/schemas/AdminRegistration'
//  *           examples:
//  *             client:
//  *               summary: Inscription Client (avec QR Code)
//  *               value:
//  *                 role: "client"
//  *                 firstName: "Awa"
//  *                 lastName: "Ouédraogo"
//  *                 email: "awa.client@gmail.com"
//  *                 phone: "+22670123456"
//  *                 password: "motDePasseFort123"
//  *                 acceptTerms: true
//  *                 receiveOffers: false
//  *                 address:
//  *                   street: "Rue 14.19"
//  *                   doorNumber: "12"
//  *                   doorColor: "Bleu"
//  *                   sector: "Secteur 30"
//  *                   neighborhood: "Tampouy"
//  *                   city: "Ouagadougou"
//  *                   postalCode: "22600"
//  *                   arrondissement: "Arrondissement 3"
//  *             agence:
//  *               summary: Inscription Agence
//  *               value:
//  *                 role: "agence"
//  *                 firstName: "Jean"
//  *                 lastName: "Dupont"
//  *                 email: "agence@example.com"
//  *                 phone: "+22670123456"
//  *                 password: "motDePasseFort123"
//  *                 acceptTerms: true
//  *                 receiveOffers: true
//  *                 agencyName: "Agence Propreté Faso"
//  *                 agencyDescription: "Entreprise spécialisée dans la collecte des déchets."
//  *                 address:
//  *                   street: "Rue 18.34"
//  *                   sector: "Secteur 30"
//  *                   neighborhood: "Karpala"
//  *                   arrondissement: "Arrondissement 12"
//  *                   city: "Ouagadougou"
//  *                   postalCode: "22600"
//  *             collector:
//  *               summary: Inscription Collecteur
//  *               value:
//  *                 firstName: "Marc"
//  *                 lastName: "Leroy"
//  *                 email: "marc.leroy@ecocollecte.fr"
//  *                 password: "password123"
//  *                 phone: "+33123456791"
//  *                 role: "collector"
//  *                 acceptTerms: true
//  *                 receiveOffers: false
//  *                 agencyId: "507f1f77bcf86cd799439013"
//  *                 planning: "Lun-Ven 6h-14h"
//  *                 collection: "Ordures ménagères"
//  *             manager:
//  *               summary: Inscription Manager
//  *               value:
//  *                 firstName: "Sophie"
//  *                 lastName: "Moreau"
//  *                 email: "sophie.moreau@ecocollecte.fr"
//  *                 password: "password123"
//  *                 phone: "+33123456792"
//  *                 role: "manager"
//  *                 acceptTerms: true
//  *                 receiveOffers: false
//  *                 agencyId: "507f1f77bcf86cd799439013"
//  *                 nbManager: 2
//  *                 activity: "Supervision des collectes"
//  *             municipality:
//  *               summary: Inscription Municipalité
//  *               value:
//  *                 firstName: "Thomas"
//  *                 lastName: "Bernard"
//  *                 email: "thomas.bernard@mairie-paris.fr"
//  *                 password: "password123"
//  *                 phone: "+33123456793"
//  *                 role: "municipality"
//  *                 acceptTerms: true
//  *                 receiveOffers: false
//  *                 municipalityCode: "75056"
//  *                 region: "Île-de-France"
//  *             super_admin:
//  *               summary: Inscription Super Admin
//  *               value:
//  *                 firstName: "Admin"
//  *                 lastName: "System"
//  *                 email: "admin@system.fr"
//  *                 password: "password123"
//  *                 phone: "+33123456794"
//  *                 role: "super_admin"
//  *                 acceptTerms: true
//  *                 receiveOffers: false
//  *                 adminLevel: "super"
//  *                 permissions: ["users:read", "users:write", "system:admin"]
//  *     responses:
//  *       201:
//  *         description: Utilisateur créé avec succès
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/RegistrationSuccessResponse'
//  *             examples:
//  *               client_success:
//  *                 summary: Réponse pour un client
//  *                 value:
//  *                   success: true
//  *                   message: "Inscription client réussie"
//  *                   data:
//  *                     userId: "507f1f77bcf86cd799439011"
//  *                     roleId: "507f1f77bcf86cd799439012"
//  *                     firstName: "Awa"
//  *                     lastName: "Ouédraogo"
//  *                     email: "awa.client@gmail.com"
//  *                     phone: "+22670123456"
//  *                     role: "client"
//  *                     status: "active"
//  *                     acceptTerms: true
//  *                     receiveOffers: false
//  *                     address:
//  *                       street: "Rue 14.19"
//  *                       doorNumber: "12"
//  *                       doorColor: "Bleu"
//  *                       sector: "Secteur 30"
//  *                       neighborhood: "Tampouy"
//  *                       city: "Ouagadougou"
//  *                       postalCode: "22600"
//  *                       arrondissement: "Arrondissement 3"
//  *                     qrCode: "CLIENT-1640995200000-abc123def"
//  *                     qrCodeImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
//  *               agence_success:
//  *                 summary: Réponse pour une agence
//  *                 value:
//  *                   success: true
//  *                   message: "Inscription agence réussie"
//  *                   data:
//  *                     userId: "507f1f77bcf86cd799439013"
//  *                     roleId: "507f1f77bcf86cd799439014"
//  *                     firstName: "Jean"
//  *                     lastName: "Dupont"
//  *                     email: "agence@example.com"
//  *                     phone: "+22670123456"
//  *                     role: "agence"
//  *                     status: "active"
//  *                     acceptTerms: true
//  *                     receiveOffers: true
//  *                     agencyName: "Agence Propreté Faso"
//  *                     agencyDescription: "Entreprise spécialisée dans la collecte des déchets."
//  *                     address:
//  *                       street: "Rue 18.34"
//  *                       sector: "Secteur 30"
//  *                       neighborhood: "Karpala"
//  *                       arrondissement: "Arrondissement 12"
//  *                       city: "Ouagadougou"
//  *                       postalCode: "22600"
//  *       400:
//  *         description: Données invalides ou manquantes
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *             examples:
//  *               missing_fields:
//  *                 value:
//  *                   success: false
//  *                   message: "Champs obligatoires manquants: firstName, email, acceptTerms"
//  *                   error: "Champs obligatoires manquants: firstName, email, acceptTerms"
//  *                   timestamp: "2024-01-01T12:00:00.000Z"
//  *               invalid_role:
//  *                 value:
//  *                   success: false
//  *                   message: "Impossible de déterminer le rôle. Veuillez spécifier un rôle valide ou fournir les champs nécessaires."
//  *                   error: "Impossible de déterminer le rôle. Veuillez spécifier un rôle valide ou fournir les champs nécessaires."
//  *                   timestamp: "2024-01-01T12:00:00.000Z"
//  *       409:
//  *         description: Conflit (email déjà utilisé ou dépendances manquantes)
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *             examples:
//  *               email_exists:
//  *                 value:
//  *                   success: false
//  *                   message: "Cet email est déjà utilisé"
//  *                   error: "Cet email est déjà utilisé"
//  *                   timestamp: "2024-01-01T12:00:00.000Z"
//  *               dependency_missing:
//  *                 value:
//  *                   success: false
//  *                   message: "L'agence spécifiée n'existe pas"
//  *                   error: "L'agence spécifiée n'existe pas"
//  *                   timestamp: "2024-01-01T12:00:00.000Z"
//  *       422:
//  *         description: Rôle non supporté ou données non traitables
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *             examples:
//  *               unsupported_role:
//  *                 value:
//  *                   success: false
//  *                   message: "Rôle non supporté: invalid_role"
//  *                   error: "Rôle non supporté: invalid_role"
//  *                   timestamp: "2024-01-01T12:00:00.000Z"
//  *       500:
//  *         description: Erreur serveur interne
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *             examples:
//  *               server_error:
//  *                 value:
//  *                   success: false
//  *                   message: "Erreur interne du serveur"
//  *                   error: "Erreur interne du serveur"
//  *                   timestamp: "2024-01-01T12:00:00.000Z"
//  */