/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - sender
 *         - receiver
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique généré par MongoDB
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         sender:
 *           type: string
 *           description: Référence vers l'utilisateur associé
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         receiver:
 *           type: string
 *           description: Référence vers l'utilisateur associé
 *           example: 615c1b5fcf1c2a3b2f4e4f22
 *         content:
 *           type: string
 *           description: Message envoyé
 *           example: Dupont
 *         read:
 *           type: boolean
 *           description: Indique si la message a été lue
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
