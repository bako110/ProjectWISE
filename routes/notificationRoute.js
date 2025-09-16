import express from 'express';
import { createNotification, getUserNotifications, markNotificationAsRead, deleteNotification } from '../controllers/notificationController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API pour gérer les notifications
 */


// Route to create a notification
/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Créer une notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - message
 *               - type
 *             properties:
 *               user:
 *                 type: string
 *                 example: "64fa7cf123abc456def78901"
 *               message:
 *                 type: string
 *                 example: "Bonjour, je suis interessé par vos services."
 *               type:
 *                 type: string
 *                 enum: [Subscribed, Planning, Assingnment]
 *                 default: Subscribed
 *     responses:
 *       201:
 *         description: Notification créee avec succès
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Champs obligatoires manquants ou invalides
 *       500:
 *         description: Erreur interne du serveur
 */

// Route to get notifications for a user
/**
 * @swagger
 * /api/notifications/{userId}:
 *   get:
 *     summary: Obtenir les notifications d'un utilisateur
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Erreur interne du serveur
 */

// Route to mark a notification as read
/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */

// Route to delete a notification
/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: Supprimer une notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification supprimée avec succès
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */

router.post('/notifications', createNotification);
router.get('/notifications/:userId', getUserNotifications);
router.patch('/notifications/:notificationId/read', markNotificationAsRead);
router.delete('/notifications/:notificationId', deleteNotification);

export default router;