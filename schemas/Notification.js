/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - user
 *         - message
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique généré par MongoDB
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         user:
 *           type: string
 *           description: Référence vers l'utilisateur associé
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         message:
 *           type: string
 *           description: Message de la notification
 *           example: Dupont
 *         type:
 *           type: string
 *           enum: [Subscribed, Planning, Assingnment, Signalement]
 *           description: Type de la notification
 *           example: Subscribed
 *         read:
 *           type: boolean
 *           description: Indique si la notification a été lue
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-02T00:00:00.000Z
 */
