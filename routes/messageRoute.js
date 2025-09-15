import express from 'express';
import { sendMessage, countUnreadMessages, getInbox, markAsRead, deleteMessage } from '../controllers/messageController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64fa7cf123abc456def78903"
 *         senderId:
 *           type: string
 *           example: "64fa7cf123abc456def78901"
 *         receiverId:
 *           type: string
 *           example: "64fa7cf123abc456def78902"
 *         content:
 *           type: string
 *           example: "Bonjour, je suis intéressé par vos services."
 *         isRead:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-09-11T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-09-11T10:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: API pour gérer les messages entre clients et agences
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Envoyer un message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *               - receiverId
 *               - content
 *             properties:
 *               senderId:
 *                 type: string
 *                 example: "64fa7cf123abc456def78901"
 *               receiverId:
 *                 type: string
 *                 example: "64fa7cf123abc456def78902"
 *               content:
 *                 type: string
 *                 example: "Bonjour, je suis intéressé par vos services."
 *     responses:
 *       201:
 *         description: Message envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Champs requis manquants
 *       500:
 *         description: Erreur serveur
 */
router.post('/messages', sendMessage);

/**
 * @swagger
 * /api/messages/unread-count/{userId}:
 *   get:
 *     summary: Compter les messages non lus pour un utilisateur
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Nombre de messages non lus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *                   example: 3
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/messages/unread-count/:userId', countUnreadMessages);

/**
 * @swagger
 * /api/messages/{userId}:
 *   get:
 *     summary: Récupérer la boîte de réception d'un utilisateur
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des messages reçus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/messages/:userId', getInbox);

/**
 * @swagger
 * /api/messages/{messageId}/mark-read:
 *   put:
 *     summary: Marquer un message comme lu
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du message
 *     responses:
 *       200:
 *         description: Message marqué comme lu
 *       404:
 *         description: Message non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/messages/:messageId/mark-read', markAsRead);

/**
 * @swagger
 * /api/messages/{messageId}/delete:
 *   delete:
 *     summary: Supprimer un message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du message
 *     responses:
 *       200:
 *         description: Message supprimé avec succès
 *       404:
 *         description: Message non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/messages/:messageId/delete', deleteMessage);

export default router;