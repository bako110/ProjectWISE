/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       required:
 *         - clientId
 *         - agencyId
 *         - pricingId
 *         - startDate
 *         - endDate
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique généré automatiquement par MongoDB
 *           example: 64b6f1e8c72a3a001f4d9e7a
 *         clientId:
 *           type: string
 *           description: ID du client (référence à la collection "User")
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         agencyId:
 *           type: string
 *           description: ID de l'agence (référence à la collection "Agency")
 *           example: 615c1b5fcf1c2a3b2f4e4f33
 *         pricingId:
 *           type: string
 *           description: ID du plan tarifaire (référence à la collection "Pricing")
 *           example: 615c1b5fcf1c2a3b2f4e4f44
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Date de début de l’abonnement
 *           example: 2025-01-01T00:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Date de fin de l’abonnement
 *           example: 2025-12-31T23:59:59.000Z
 *         isActive:
 *           type: boolean
 *           description: Indique si l’abonnement est toujours actif
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l’abonnement
 *           example: 2025-11-06T09:30:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de l’abonnement
 *           example: 2025-11-06T09:45:00.000Z
 */
