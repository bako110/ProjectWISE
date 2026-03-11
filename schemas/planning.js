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
 *           description: Référence vers l'utilisateur collecteur (ancien format, toujours supporté)
 *           example: 64f1b82a5e3d9c2b68d94b72
 *         collectors:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: Tableau des IDs des collecteurs assignés (nouveau format recommandé)
 *           example: ["64f1b82a5e3d9c2b68d94b72", "64f1b82a5e3d9c2b68d94b75"]
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
 *           type: string
 *           enum: [Scheduled, Completed, Cancelled, Asked]
 *           default: Scheduled
 *           description: Statut du planning
 *           example: Scheduled
 *         pricingId:
 *           type: string
 *           format: objectId
 *           description: Référence vers le type d'abonnement
 *           example: 64f1b82a5e3d9c2b68d94b74
 *         isRecurring:
 *           type: boolean
 *           default: false
 *           description: Indique si le planning est récurrent (duplication automatique)
 *           example: true
 *         recurrenceType:
 *           type: string
 *           enum: [weekly, biweekly, monthly]
 *           default: weekly
 *           description: Type de récurrence (hebdomadaire, bi-hebdomadaire, mensuel)
 *           example: weekly
 *         numberOfWeeks:
 *           type: integer
 *           default: 1
 *           description: Nombre total de semaines pour la récurrence
 *           example: 4
 *         weeksRemaining:
 *           type: integer
 *           default: 0
 *           description: Nombre de semaines restantes avant la fin de la récurrence
 *           example: 3
 *         parentPlanningId:
 *           type: string
 *           format: objectId
 *           description: Référence vers le planning parent (si c'est une duplication)
 *           example: 64f1b82a5e3d9c2b68d94b75
 *         nextDuplicationDate:
 *           type: string
 *           format: date
 *           description: Prochaine date de duplication automatique
 *           example: 2025-11-15
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
