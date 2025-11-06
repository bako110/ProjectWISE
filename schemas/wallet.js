/**
 * @swagger
 * components:
 *   schemas:
 *     Wallet:
 *       type: object
 *       required:
 *         - userId
 *         - balance
 *         - kind
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique généré automatiquement par MongoDB
 *           example: 64b6f1e8c72a3a001f4d9e7a
 *         userId:
 *           type: string
 *           description: ID de l'utilisateur associé (référence à la collection "User")
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         balance:
 *           type: number
 *           description: Solde actuel du portefeuille
 *           example: 250.75
 *         kind:
 *           type: string
 *           description: Type de portefeuille (standard ou premium)
 *           enum: [standard, premium]
 *           example: premium
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du portefeuille
 *           example: 2025-11-06T09:30:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour du portefeuille
 *           example: 2025-11-06T09:45:00.000Z
 */
