/**
 * @swagger
 * components:
 *   schemas:
 *     Pricing:
 *       type: object
 *       required:
 *         - agencyId
 *         - planType
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique généré automatiquement par MongoDB
 *           example: 64b6f1e8c72a3a001f4d9e7a
 *         agencyId:
 *           type: string
 *           description: ID de l'agence (référence à la collection "Agency")
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         planType:
 *           type: string
 *           description: Type d'abonnement proposé
 *           enum: [standard, premium, enterprise]
 *           example: premium
 *         price:
 *           type: number
 *           description: Prix de l'abonnement (en euros)
 *           example: 1200
 *         description:
 *           type: string
 *           description: Description optionnelle du plan
 *           example: Offre premium avec support 24/7 et statistiques avancées
 *         numberOfPasses:
 *           type: number
 *           description: Nombre de passages inclus dans le plan
 *           example: 10
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'entrée
 *           example: 2025-11-06T09:30:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 *           example: 2025-11-06T09:35:00.000Z
 */
