/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - phone
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique généré par MongoDB
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         firstName:
 *           type: string
 *           description: Prénom de l'utilisateur
 *           example: Jean
 *         lastName:
 *           type: string
 *           description: Nom de famille de l'utilisateur
 *           example: Dupont
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email unique de l'utilisateur
 *           example: jean.dupont@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: Mot de passe de l'utilisateur (stocké de manière sécurisée)
 *           example: monMotDePasse123
 *           writeOnly: true
 *         role:
 *           type: string
 *           enum: [client, collector, manager, municipality, super_admin]
 *           description: Rôle de l'utilisateur
 *           example: client
 *         phone:
 *           type: string
 *           description: Numéro de téléphone unique
 *           example: "770000000"
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: Rue 12
 *             arrondissement:
 *               type: string
 *               example: Plateau
 *             sector:
 *               type: string
 *               example: Centre-ville
 *             doorNumber:
 *               type: string
 *               example: 12B
 *             doorColor:
 *               type: string
 *               example: Bleu
 *             neighborhood:
 *               type: string
 *               example: Medina
 *             city:
 *               type: string
 *               example: Dakar
 *             postalCode:
 *               type: string
 *               example: 10000
 *             location:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   enum: [Point]
 *                   example: Point
 *                 coordinates:
 *                   type: array
 *                   minItems: 2
 *                   maxItems: 2
 *                   items:
 *                     type: number
 *                   example: [-17.444, 14.692]
 *         status:
 *           type: string
 *           enum: [active, inactive, deleted]
 *           default: active
 *           example: active
 *         acceptTerms:
 *           type: boolean
 *           default: false
 *           example: true
 *         receiveOffers:
 *           type: boolean
 *           default: false
 *           example: false
 *         agencyId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Référence vers une agence (si applicable)
 *           example: 615c1b5fcf1c2a3b2f4e4f99
 *         qrToken:
 *           type: string
 *           nullable: true
 *           example: QRTOKEN123
 *         qrCode:
 *           type: string
 *           nullable: true
 *           example: https://example.com/qrcode.png
 *         nbGestionnaires:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         isOwnerAgency:
 *           type: boolean
 *           nullable: true
 *           example: true
 *         deletedate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-02T00:00:00.000Z
 */
