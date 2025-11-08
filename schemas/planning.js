/**
 * @swagger
 * components:
 *   schemas:
 *     Planning:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           example: 64f1b82a5e3d9c2b68d94b70
 *         managerId:
 *           type: string
 *           format: objectId
 *           description: Référence vers l'utilisateur manager
 *           example: 64f1b82a5e3d9c2b68d94b71
 *         date:
 *           type: string
 *           format: date
 *           description: Date du planning
 *           example: 2025-11-08
 *         zone:
 *           type: string
 *           description: zone de planning
 *           example: pissy
 *         startTime:
 *           type: string
 *           description: Heure de début (format HH:mm)
 *           example: "08:00"
 *         endTime:
 *           type: string
 *           description: Heure de fin (format HH:mm)
 *           example: "17:00"
 *         collectorId:
 *           type: string
 *           format: objectId
 *           description: Référence vers l'utilisateur collecteur
 *           example: 64f1b82a5e3d9c2b68d94b72
 *         agencyId:
 *           type: string
 *           format: objectId
 *           description: Référence vers l'agence concernée
 *           example: 64f1b82a5e3d9c2b68d94b73
 *         code:
 *           type: string
 *           description: Code unique du planning
 *           example: "PLN-2025-001"
 *         numberOfClients:
 *           type: integer
 *           default: 0
 *           description: Nombre de clients assignés à ce planning
 *           example: 12
 *         status:
 *           type: boolean
 *           default: true
 *           description: Statut actif/inactif du planning
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-11-08T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-11-08T12:30:00.000Z
 *       required:
 *         - managerId
 *         - date
 *         - startTime
 *         - endTime
 *         - collectorId
 *         - agencyId
 *         - zone
 */
