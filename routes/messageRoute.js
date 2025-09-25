import express from 'express';
import { sendMessage, countUnreadMessages, getInbox, markAsRead, deleteMessage, getMessages,getGroupeName } from '../controllers/messageController.js';

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
 *               sender:
 *                 type: string
 *                 example: "64fa7cf123abc456def78901"
 *               receiver:
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

/**
 * @swagger
 * /api/messages/{userId}/groupe:
 *   get:
 *     summary: Récupérer les utilisateurs avec qui l'utilisateur a échangé des messages
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur connecté
 *     responses:
 *       200:
 *         description: Liste des utilisateurs avec qui l'utilisateur a échangé
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: ID de l'interlocuteur
 *                   role:
 *                     type: string
 *                     enum: [client, agency]
 *                   firstName:
 *                     type: string
 *                     nullable: true
 *                   lastName:
 *                     type: string
 *                     nullable: true
 *                   agencyName:
 *                     type: string
 *                     nullable: true
 *       500:
 *         description: Erreur serveur
 */
router.get('/messages/:userId/groupe', getGroupeName);


/**
 * @swagger
 * /api/messages/{userId}/inbox/{receiverId}:
 *   get:
 *     summary: Récupérer les messages entre deux utilisateurs
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur connecté
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'autre utilisateur dans la conversation
 *     responses:
 *       200:
 *         description: Liste des messages triés par date croissante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       500:
 *         description: Erreur serveur
 */
router.get('/messages/:userId/inbox/:receiverId', getMessages);

export default router;