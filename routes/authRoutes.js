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
 *     RegistrationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Utilisateur créé avec succès"
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 status:
 *                   type: string
 *             roleData:
 *               type: object
 *             role:
 *               type: string
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
 *       Point d'entrée unique pour l'inscription de tous les types d'utilisateurs.
 *       Le système détecte automatiquement le rôle ou vous pouvez le spécifier explicitement.
 *       
 *       **Rôles supportés :** client, agency, collector, manager, municipality, super_admin
 *       
 *       **Détection automatique :**
 *       - agency → agencyName, name, zoneActivite
 *       - collector → agencyId + planning/collection
 *       - manager → agencyId + nbManager/activity
 *       - municipality → isMunicipality, municipalityCode
 *       - super_admin → isSuperAdmin, adminLevel
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
 *               summary: Inscription Client
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
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Utilisateur créé avec succès"
 *                   data:
 *                     user:
 *                       _id: "507f1f77bcf86cd799439014"
 *                       firstname: "John"
 *                       lastname: "Doe"
 *                       email: "john.doe@example.com"
 *                       role: "client"
 *                       status: "active"
 *                     roleData:
 *                       _id: "507f1f77bcf86cd799439015"
 *                       userId: "507f1f77bcf86cd799439014"
 *                       status: "active"
 *                     role: "client"
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 value:
 *                   success: false
 *                   message: "Champs obligatoires manquants: firstname, email"
 *                   error: "Validation Error"
 *               email_exists:
 *                 value:
 *                   success: false
 *                   message: "Cet email est déjà utilisé"
 *                   error: "Duplicate Email"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */