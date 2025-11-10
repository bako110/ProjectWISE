/**
 * @swagger
 * components:
 *   schemas:
 *     Collecte:
 *       type: object
 *       required:
 *         - agencyId
 *         - collectorId
 *         - clientId
 *         - date
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique généré par MongoDB
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         agencyId:
 *           type: string
 *           description: Référence l'agence associé
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         collectorId:
 *           type: string
 *           description: Référence le collecteur associé
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         clientId:
 *           type: string
 *           description: Référence le client associé
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date de la collecte
 *           example: 2023-01-01T00:00:00.000Z
 *         status:
 *           type: string
 *           enum: [collected, Scheduled, Completed, Cancelled, reported]
 *           description: Statut de la collecte
 *           example: Scheduled
 *         code:
 *           type: string
 *           description: Code de la collecte
 *           example: 1234ABCD
 *         nbCollecte:
 *           type: number
 *           description: Nombre de collectes
 *           example: 0.25
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-02T00:00:00.000Z
 */
